# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Popcorn Time is a cross-platform BitTorrent client with an integrated media player built on NW.js (Node-webkit). The application provides streaming capabilities for movies, TV shows, and anime.

## Common Commands

- `yarn start` - Start the application in development mode
- `yarn build` - Build the application (includes CSS compilation and NW.js packaging)
- `yarn clean` - Clean all build artifacts
- `yarn dist` - Create redistributable packages for all platforms
- `yarn test` - Run tests (includes JSHint linting)

### Gulp Tasks (via yarn scripts)
- `gulp css` - Compile Stylus files to CSS
- `gulp jshint` - Lint JavaScript files
- `gulp run` - Run the app directly using cached NW.js binary
- `gulp dist --platforms=<platform>` - Build for specific platforms (win32, win64, linux32, linux64, osx64, all)

## Architecture

### Core Structure
- **Frontend**: Backbone.js + Marionette framework with jQuery
- **Styling**: Stylus CSS preprocessor with theme support
- **Runtime**: NW.js for desktop application wrapper
- **Streaming**: WebTorrent for P2P streaming
- **Database**: NeDB for local data storage

### Key Directories
- `src/app/` - Main application code
  - `lib/views/` - Backbone/Marionette views
  - `lib/models/` - Data models and collections
  - `lib/providers/` - Content providers (movies, TV, anime)
  - `lib/device/` - Media streaming device integrations (Chromecast, DLNA, etc.)
  - `butter-provider/` - Provider implementations for content sources
  - `templates/` - HTML templates
  - `styl/` - Stylus stylesheets (compiled to `themes/`)
  - `language/` - i18n translation files

### Provider System
The application uses a modular provider system for content sources:
- `butter-provider/movie.js` - Movie content provider
- `butter-provider/tv.js` - TV show provider  
- `butter-provider/anime.js` - Anime content provider
- `butter-provider/yts.js` - YTS torrent provider

### Theme System
Multiple themes are available in `src/app/styl/`:
- Official themes (Dark, Light, Black & Yellow, etc.)
- Community themes (Dark Orange, Black & Red, etc.)
- Compile with `gulp css` to generate CSS files in `src/app/themes/`

## Development Notes

### Code Style
- JSHint is used for linting with configuration in `.jshintrc`
- Code beautification available via `gulp jsbeautifier`
- Pre-commit hooks run JSHint automatically

### Building & Distribution
- Uses NW.js version 0.86.0 by default
- Cross-platform builds supported (Windows, macOS, Linux)
- Packages can be generated as ZIP archives, NSIS installers (Windows), DEB packages (Linux), and PKG installers (macOS)
- Build artifacts are placed in `build/` directory

### Device Integration
The app supports streaming to various devices:
- Chromecast (`lib/device/chromecast.js`)
- DLNA/UPnP devices (`lib/device/dlna.js`)
- AirPlay (`lib/device/airplay.js`)
- External players (`lib/device/ext_player.js`)

### Content Sources
Content is fetched from various providers with built-in caching and health checking for torrents. The application includes subtitle support via OpenSubtitles API integration.