from PIL import Image, ImageDraw, ImageFont
import os

def generate_icon(size):
    # Create a new image with transparent background
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Calculate font size (70% of icon size)
    font_size = int(size * 0.7)
    
    # Try to use Arial, fall back to default if not available
    try:
        font = ImageFont.truetype("Arial", font_size)
    except:
        font = ImageFont.load_default()
    
    # Draw the letter G in black
    text = "G"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Draw the text
    draw.text((x, y), text, font=font, fill='black')
    
    return image

# Create images directory if it doesn't exist
if not os.path.exists('images'):
    os.makedirs('images')

# Generate icons for all sizes
sizes = [16, 48, 128]
for size in sizes:
    icon = generate_icon(size)
    icon.save(f'images/icon{size}.png')
    print(f'Generated icon{size}.png')
