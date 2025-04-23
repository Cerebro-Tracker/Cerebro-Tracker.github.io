# Cerebro Tracker

Cerebro Tracker is a web application for tracking your X-Men comic reading progress. Named after Professor X's mutant-tracking device, this app helps you keep track of which X-Men comics you've read and which ones you still need to read.

![Cerebro Tracker Logo](logo.png)

## Features

- **Track Your Reading Progress**: Mark comics as read and keep track of your progress through the X-Men universe.
- **Sortable Comic Table**: Sort comics by title, publication date, era, writer, or artist.
- **Search Functionality**: Easily find comics by title, character, writer, or artist.
- **Filter Options**: Filter comics by era, writer, artist, character, or read status.
- **Series Grouping**: View comics grouped by series and mark entire series as read.
- **Writer Grouping**: View comics grouped by writer and mark all comics by a writer as read.
- **User Profiles**: Create an account to save your reading progress across devices.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.

## Getting Started

### Using the App

1. Visit [https://your-username.github.io/Cerebro-Tracker.github.io/](https://your-username.github.io/Cerebro-Tracker.github.io/)
2. Create an account or log in
3. Start tracking your X-Men comic reading progress!

### Local Development

To run the app locally:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/Cerebro-Tracker.github.io.git
   ```
2. Navigate to the project directory:
   ```
   cd Cerebro-Tracker.github.io
   ```
3. Open `index.html` in your browser

## How It Works

Cerebro Tracker is a client-side web application built with HTML, CSS, and JavaScript. It uses:

- **Bootstrap 5** for responsive layout and UI components
- **Font Awesome** for icons
- **PapaParse** for CSV parsing
- **localStorage** for storing user data and reading progress

The comic data is loaded from the `import.csv` file, which contains information about X-Men comics including titles, publication dates, writers, artists, and characters.

## Project Structure

- `index.html` - Main HTML file
- `css/styles.css` - Custom CSS styles
- `js/app.js` - Main application logic
- `js/auth.js` - Authentication functionality
- `js/comics.js` - Comic loading and display functionality
- `js/series.js` - Series and writer grouping functionality
- `import.csv` - Comic data
- `logo.png` - Application logo

## User Data

All user data is stored locally in your browser using localStorage. This includes:

- User account information
- Reading progress
- User preferences

No data is sent to any server, ensuring your privacy.

## Contributing

Contributions are welcome! If you'd like to contribute to Cerebro Tracker, please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data compiled from various X-Men comic resources
- Inspired by the X-Men universe created by Stan Lee and Jack Kirby
- Built with love for X-Men fans everywhere