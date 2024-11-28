# Talk-G Chrome Extension

A Chrome extension for managing and reading articles with Supabase backend integration.

## Features

- 📚 Article List View
  - Clean and modern UI
  - Article previews with titles and descriptions
  - Smooth hover animations
  - Click to view full article details
  
- 📖 Article Detail View
  - Full article content
  - Easy navigation with back button
  - Clean typography for better readability
  
- 🔧 Technical Features
  - Supabase integration for data storage
  - Comprehensive testing suite
  - Screenshot testing for UI consistency
  - Error handling and status messages

## Screenshots

### Article List View
![Article List](docs/images/screenshots/article-list.png)

### Article Detail View
![Article Detail](docs/images/screenshots/article-detail.png)

### Error State
![Error State](docs/images/screenshots/error-state.png)

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm
- Chrome browser
- Supabase account and project

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/talk-g.git
cd talk-g
```

2. Install dependencies:
```bash
npm install
```

3. Configure Supabase:
   - Create a `.env` file with your Supabase credentials
   - Update `js/config.js` with your project details

4. Build the extension:
```bash
npm run build
```

5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked" and select the `dist` directory

### Testing

The project includes several types of tests:

- Unit Tests:
```bash
npm run test
```

- Integration Tests:
```bash
npm run test:integration
```

- Screenshot Tests:
```bash
npm run test:screenshot
```

### Project Structure

```
talk-g/
├── dist/               # Built extension files
├── js/                 # Source JavaScript files
│   ├── popup.js       # Main extension UI logic
│   ├── background.js  # Background service worker
│   └── config.js      # Configuration
├── docs/              # Documentation
│   └── images/        # Screenshots and images
├── tests/             # Test files
└── popup.html         # Extension popup HTML
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/) for making this possible
- All contributors who have helped with code, issues, and ideas

[View in Chinese (查看中文版)](README_CN.md)
[View in Japanese (日本語で表示)](README_JP.md)
