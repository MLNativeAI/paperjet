import base64
import logging
import requests
import pymupdf
import tempfile
import os
from fastapi import FastAPI, Form
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
import pymupdf4llm
import ocrmypdf
from ocrmypdf.exceptions import PriorOcrFoundError

# Configure logging
# logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PaperJet ML service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
def root():
    return {"message": "PaperJet ML Service is running"}


@app.post("/ocr")
def ocr(presigned_url: Annotated[str, Form()]):
    try:
        # Download the PDF from presigned URL
        r = requests.get(presigned_url)
        data = r.content

        # Create temporary files for input and output
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as input_pdf:
            input_pdf.write(data)
            input_pdf_path = input_pdf.name

        output_pdf_path = input_pdf_path.replace(".pdf", "_ocr.pdf")

        try:
            ocrmypdf.ocr(
                input_pdf_path,
                output_pdf_path,
                language=["eng", "pol"],
                deskew=True,
                clean=True,
            )
            pdf_document = pymupdf.Document(filename=output_pdf_path)
            md_text = pymupdf4llm.to_markdown(doc=pdf_document)

            return {
                "success": True,
                "markdown": md_text,
            }
        except PriorOcrFoundError:
            logger.info("PDF already has text, processing original file directly")
            pdf_document = pymupdf.Document(stream=data)
            md_text = pymupdf4llm.to_markdown(doc=pdf_document)
            return {
                "success": True,
                "markdown": md_text,
            }
        except Exception as e:
            # For any other OCR error, fall back to original file processing
            logger.warning(f"OCR failed, processing original file directly: {str(e)}")
            pdf_document = pymupdf.Document(stream=data)
            md_text = pymupdf4llm.to_markdown(doc=pdf_document)

            return {
                "success": True,
                "markdown": md_text,
            }
        finally:
            # Clean up temporary files
            try:
                if os.path.exists(input_pdf_path):
                    os.unlink(input_pdf_path)
                if os.path.exists(output_pdf_path):
                    os.unlink(output_pdf_path)
            except Exception as e:
                logger.warning(f"Error cleaning up temporary files: {str(e)}")

    except Exception as e:
        logger.error(f"Error parsing PDF: {str(e)}")
        return {"error": str(e)}


@app.post("/split-pdf")
def split_pdf(presigned_url: Annotated[str, Form()]):
    try:
        r = requests.get(presigned_url)
        data = r.content
        pdf_document = pymupdf.Document(stream=data)
        total_pages = len(pdf_document)
        pages_data = []

        # # Calculate zoom factor for 300 DPI (default PDF is 72dpi)
        # zoom = 300 / 72
        #
        # Process each page
        for page_num in range(total_pages):
            page = pdf_document[page_num]
            # mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap()

            # Get image dimensions
            width = pix.width
            height = pix.height

            # Convert pixmap to PNG bytes
            png_bytes = pix.tobytes("png")

            # Convert PNG bytes to base64
            base64_image = base64.b64encode(png_bytes).decode("utf-8")

            pages_data.append(
                {
                    "page_number": page_num + 1,
                    "image_data": base64_image,
                    "width": width,
                    "height": height,
                }
            )

            logger.info(f"Processed page {page_num + 1} - dimensions: {width}x{height}")

        pdf_document.close()

        # Clean up temporary PDF file
        # os.unlink(temp_pdf_path)

        return {
            "success": True,
            # "job_id": job_id,
            "total_pages": total_pages,
            "pages": pages_data,
        }

    except Exception as e:
        logger.error(f"Error splitting PDF: {str(e)}")
        return {"error": str(e)}
        # Clean up temporary file if it exists
