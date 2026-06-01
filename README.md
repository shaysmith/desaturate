# Desat

Desat is a lightweight Chrome extension that lets you toggle grayscale ("desaturation") on images and favicons, either individually, per-domain, or all at once, with a simple right-click context menu. It remembers your preferences across page loads and browser restarts.

## Features
- **Toggle Desat for this image**: Desaturate or restore a single image.
- **Toggle Desat for all images on this domain**: Desaturate or restore every image on the current domain.
- **Toggle Desat for favicon for this domain**: Desaturate or restore the page's favicon.
- **Toggle Desat for all images and favicon for this domain**: Desaturate or restore both images and favicon in one click.
- Persistent per-image and per-domain settings stored locally.
- Automatic application on page load and for dynamically added content.

## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/<your-username>/desat.git
   cd desat
   ```
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select this project's directory.

## Usage
- **On images**: Right-click any image to access:
  - *Toggle Desat for this image*
  - *Toggle Desat for all images on this domain*
  - *Toggle Desat for favicon for this domain*
  - *Toggle Desat for all images and favicon for this domain*
- **On page (elsewhere)**: Right-click anywhere else on the page to access:
  - *Toggle Desat for favicon for this domain*
  - *Toggle Desat for all images and favicon for this domain*
- Your choices persist; reloading or revisiting pages retains desaturation settings.

## Project Structure
- `manifest.json`: Chrome extension manifest (v3) declaring permissions and scripts.
- `background.js`: Creates and handles context-menu entries, manages local storage of flags.
- `content.js`: Applies CSS filters to images and updates favicons based on stored settings.

## Contributing
Contributions, issues, and feature requests are welcome! Feel free to:
- Fork the repo and create a new branch for your changes.
- Submit a pull request with a clear description of your enhancements.

## License
This project is licensed under the [MIT License](LICENSE) (or choose a license of your preference).