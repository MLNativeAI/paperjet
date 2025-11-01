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
