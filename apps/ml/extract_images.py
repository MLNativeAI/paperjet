import fitz  # PyMuPDF
import os


def convert_pdf_to_images(
    pdf_path: str, output_dir: str = "extracted_pages", dpi: int = 300
):
    """
    Convert each page of a PDF file into an image.

    Args:
        pdf_path (str): Path to the PDF file
        output_dir (str): Directory where extracted images will be saved
        dpi (int): Resolution of output images (dots per inch)
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Open the PDF file
    pdf_document = fitz.open(pdf_path)

    # Calculate zoom factor based on DPI (default PDF is 72dpi)
    zoom = dpi / 72

    # Iterate through each page
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]

        # Get the page's matrix for the desired DPI
        mat = fitz.Matrix(zoom, zoom)

        # Convert page to image
        pix = page.get_pixmap(matrix=mat)

        # Generate output filename
        output_filename = os.path.join(output_dir, f"page_{page_num + 1}.png")

        # Save the image
        pix.save(output_filename)
        print(f"Saved page {page_num + 1} as: {output_filename}")

    pdf_document.close()
    print(f"\nConversion complete. Total pages converted: {len(pdf_document)}")

