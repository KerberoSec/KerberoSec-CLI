# CTF-Tracker-BOT

CTF-Tracker-BOT is a powerful and efficient Discord bot that provides real-time updates and insights on Capture The Flag (CTF) events, directly integrated with CTFtime. It enables users to track upcoming CTF events, view detailed information about teams, and even compare performance across multiple teams. Perfect for competitive CTF participants and organizers alike, this bot simplifies tracking and management of CTF competitions.

## Features

- **Real-Time CTF Updates**: Get the latest upcoming CTF events from CTFtime.
- **Team Information**: Retrieve detailed information on teams, including their rank, points, and history in previous events.
- **Team Comparison**: Compare multiple teams' performances based on their most recent 5 CTF events.
- **Command List**:
  - `/help`: Displays available bot commands.
  - `/newctfs`: Lists the top upcoming CTF events with flexible sorting options.
  - `/teaminfo`: Fetches detailed information about a specific team by name or ID.
  - `/setteams`: Allows admins to set a list of teams to be used in the `/compare` command.
  - `/compare`: Compares pre-set teams' performances in their latest 5 CTF events.

## Prerequisites

- **Node.js**: Ensure you have [Node.js](https://nodejs.org/) installed.
- **Discord Bot Token**: You need a valid Discord Bot Token. Follow [this guide](https://discord.com/developers/docs/intro) to create a bot.
- **CTFtime API**: This bot relies on the [CTFtime API](https://ctftime.org/) to fetch event and team data.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/TheLeopard65/CTF-Tracker-BOT.git
   cd CTF-Tracker-BOT
   ```

2. **Install Dependencies**
   The bot uses `discord.js`, `node-fetch`, and `node-cache` for its core functionality. Install all dependencies with npm:
   ```bash
   npm install
   ```

3. **Create `.env` File**
   In the root directory of the project, create a `.env` file and add the following:
   ```bash
   TOKEN=your-discord-bot-token
   ```

4. **Start the Bot**
   Run the bot using Node.js:
   ```bash
   npm start
   ```

5. **Bot Commands**
   Once the bot is running and added to your server, use the commands below:

   - `/help`: Displays a help message with all available bot commands.
   - `/newctfs [count] [sort]`: Fetches and displays upcoming CTF events. You can specify how many events to show and the sorting criteria (e.g., "weight", "start", "end").
   - `/teaminfo [teamid]`: Fetches information about a specific team by either name or ID.
   - `/setteams [team1,team2,...]`: Set the list of teams to be used for comparisons in `/compare`.
   - `/compare`: Compares the top 5 CTF scores of the teams you've set with `/setteams`.

## Development & Contributions

Feel free to contribute to this project by forking the repository, making changes, and submitting a pull request. Please ensure all code is properly tested before submitting.

### Installing Dependencies

To install the necessary dependencies, run:
```bash
npm install
```

### Running Locally

To run the bot locally, use the following command:
```bash
npm start
```

### Running Tests

Currently, there are no formal tests in place. To add tests, consider using libraries like [Jest](https://jestjs.io/) or [Mocha](https://mochajs.org/).

### Code Structure

- **CTF-Tracker.js**: Main bot file handling logic, commands, and API calls.
- **package.json**: Manages the bot's dependencies and scripts.
- **.gitignore**: Specifies which files and folders to ignore for Git.
- **.nixpacks**: Configuration file for deployment on [Nixpacks](https://nixpacks.com).

## Issues & Bugs

If you encounter any issues, feel free to open an issue on the [GitHub issues page](https://github.com/TheLeopard65/CTF-Tracker-BOT/issues). We'll do our best to resolve them promptly.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

- **Discord.js**: For providing the necessary framework to interact with Discord's API.
- **CTFtime**: For providing the CTF data API.

## Support

For any support or questions, feel free to reach out via the [GitHub discussions page](https://github.com/TheLeopard65/CTF-Tracker-BOT/discussions) or create an issue.

## Credits

- **Leopard (@theleopard65)**: The creator and maintainer of the CTF-Tracker-BOT.

---

Thank you for using **CTF-Tracker-BOT**! Enjoy tracking your favorite CTF events! 🎉
