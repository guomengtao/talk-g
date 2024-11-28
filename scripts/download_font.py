import os
import requests

def download_font():
    # Create fonts directory if it doesn't exist
    fonts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'css', 'fonts')
    os.makedirs(fonts_dir, exist_ok=True)
    
    # Download the font file
    font_url = 'https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
    font_path = os.path.join(fonts_dir, 'MaterialIcons-Regular.woff2')
    
    response = requests.get(font_url)
    if response.status_code == 200:
        with open(font_path, 'wb') as f:
            f.write(response.content)
        print(f'Successfully downloaded Material Icons font to {font_path}')
    else:
        print(f'Failed to download font: {response.status_code}')

if __name__ == '__main__':
    download_font()
