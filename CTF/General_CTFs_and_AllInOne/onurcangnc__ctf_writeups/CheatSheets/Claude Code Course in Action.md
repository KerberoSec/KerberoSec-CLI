
What is a Claude Code ?

![[claude1.png]]

A normal LLM cannot read directly inside of the file

![[claude2.png]]

Coding assistant enables LLM to read afile

![[claude3.png]]

Returns the intended file, request of initializatio

![[claude4.png]]

Tools are capabilities leveraged by models like Opus, Sonnet, Haiuku

![[claude5.png]]

![[claude6.png]]

![[claude7.png]]

![[claude8.png]]

![[claude9.png]]

![[claude10.png]]

![[claude11.png]]

This is not a good looking generator lets do this task with Claude Code

![[claude12.png]]

![[claude13.png]]

![[claude14.png]]

![[claude15.png]]

![[claude16.png]]

![[claude17.png]]

![[claude18.png]]

**Time to get Claude Code set up locally!**

Full setup directions can be found here: [https://code.claude.com/docs/en/quickstart](https://code.claude.com/docs/en/quickstart)

In short, you'll need to do the following:

1. `Install Claude Code`
    1. `` MacOS (Homebrew): `brew install --cask claude-code` ``
    2. MacOS, Linux, WSL: `curl -fsSL https://claude.ai/install.sh | bash`
    3. Windows CMD: `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`
2. After installation, run `claude` at your terminal. The first time you run this command you will be prompted to authenticate

If you're making use of AWS Bedrock or Google Cloud Vertex, there is some additional setup:

- Special directions for AWS Bedrock: [https://code.claude.com/docs/en/amazon-bedrock](https://code.claude.com/docs/en/amazon-bedrock)
- Special directions for Google Cloud Vertex: [https://code.claude.com/docs/en/google-vertex-ai](https://code.claude.com/docs/en/google-vertex-ai)

Working with Claude Code is more interesting if you have a project to work with.

I've put together a small project to explore with Claude Code. It is the same UI generation app shown in a previous video. **Note:** you don't have to run this project. You can always follow along with the remainder of the course with your own code base if you wish!

**Setup**

This project requires a small amount of setup:

1. Ensure you have Node JS installed locally. [Link to installation directions](https://nodejs.org/en/download).
2. Download the zip file called `uigen.zip` attached to this lecture and extract it
3. In the project directory, run `npm run setup` to install dependencies and set up a local SQLite database
4. **Optional:** this project uses Claude through the Anthropic API to generate UI components. If you want to fully test out the app, you will need to provide an API key to access the Anthropic API. _This is optional. If no API key is provided, the app will still generate some static fake code._ Here's how you can set the api key:
    1. Get an Anthropic API key at [https://console.anthropic.com/](https://console.anthropic.com/)
    2. Place your API key in the `.env` file.
5. Start the project by running `npm run dev`

#### Downloads

- [uigen.zip](https://cc.sj-cdn.net/instructor/4hdejjwplbrm-anthropic/assets/1769622681/uigen.zip?response-content-disposition=attachment&Expires=1772455574&Signature=n-g3F3cIVUiExwfLej9n2knqME7B35SXrKHUSqinuCoQvcxrYZYAvM4Z8kG8xl-tnECKX8VBGsY~vRlSYe~SueVK1BI~WkSsM7BoYafyJdwcb1FqNuax~zpAO28AGsSu5qIwIPG44n~GcyyFt2cAtrNw6aZlUbN7xJmGNM5ikTpcQXrEZIMEed4OUg-7Jcj3To0aVQRfAVi5jiRlNKvkGKt5c2MONcmKq8syiWz-kty85qOczCRVxnbxwiEsUxlg~A5J86fn2lQlni4olV5OxGwv-9XKDfNCvo1S-hvNhb5ge20F8irLn5psSTemteoxpSwypHA3tmPxbfC40qLG-A__&Key-Pair-Id=APKAI3B7HFD2VYJQK4MQ)

When working with Claude on coding projects, context management is crucial. Your project might have dozens or hundreds of files, but Claude only needs the right information to help you effectively. Too much irrelevant context actually decreases Claude's performance, so learning to guide it toward relevant files and documentation is essential.

![](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1750967940%2F004_-_Adding_Context_02.1750967940092.png)

## The /init Command

When you first start Claude in a new project, run the `/init` command. This tells Claude to analyze your entire codebase and understand:

- The project's purpose and architecture
- Important commands and critical files
- Coding patterns and structure

![](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1750967941%2F004_-_Adding_Context_05.1750967940882.png)

After analyzing your code, Claude creates a summary and writes it to a `CLAUDE.md` file. When Claude asks for permission to create this file, you can either hit Enter to approve each write operation, or press Shift+Tab to let Claude write files freely throughout your session.

## The CLAUDE.md File

The `CLAUDE.md` file serves two main purposes:

- Guides Claude through your codebase, pointing out important commands, architecture, and coding style
- Allows you to give Claude specific or custom directions

This file gets included in every request you make to Claude, so it's like having a persistent system prompt for your project.

## CLAUDE.md File Locations

Claude recognizes three different `CLAUDE.md` files in three common locations:

![](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2Fa46l9irobhg0f5webscixp0bs%2Fpublic%2F1750967941%2F004_-_Adding_Context_09.1750967941793.png)

- **CLAUDE.md**: Generated with /init, committed to source control, shared with other engineers
- **CLAUDE.local.md**: Not shared with other engineers, contains personal instructions and customizations for Claude
- **~/.claude/CLAUDE.md**: Used with all projects on your machine, contains instructions that you want Claude to follow on all projects

## Adding Custom Instructions

You can customize how Claude behaves by adding instructions to your `CLAUDE.md` file. For example, if Claude is adding too many comments to code, you can address this by updating the file.

Use the `#` command to enter "memory mode": this lets you edit your `CLAUDE.md` files intelligently. Just type something like:

```
# Use comments sparingly. Only comment complex code.
```

Claude will merge this instruction into your `CLAUDE.md` file automatically.

## File Mentions with '@'

When you need Claude to look at specific files, use the `@` symbol followed by the file path. This automatically includes that file's contents in your request to Claude.

For example, if you want to ask about your authentication system and you know the relevant files, you can type:

```
How does the auth system work? @auth
```

Claude will show you a list of auth-related files to choose from, then include the selected file in your conversation.

## Referencing Files in CLAUDE.md

You can also mention files directly in your `CLAUDE.md` file using the same `@` syntax. This is particularly useful for files that are relevant to many aspects of your project.

For example, if you have a database schema file that defines your data structure, you might add this to your `CLAUDE.md`:

```
The database schema is defined in the @prisma/schema.prisma file. Reference it anytime you need to understand the structure of data stored in the database.
```

When you mention a file this way, its contents are automatically included in every request, so Claude can answer questions about your data structure immediately without having to search for and read the schema file each time.

![[claude19.png]]

![[claude20.png]]

![[claude21.png]]

![[claude22.png]]

When working with Claude on complex tasks, you'll often need to guide the conversation to keep it focused and productive. There are several techniques you can use to control the flow of your conversation and help Claude stay on track.

## Interrupting Claude with Escape

Sometimes Claude starts heading in the wrong direction or tries to tackle too much at once. You can press the Escape key to stop Claude mid-response, allowing you to redirect the conversation.

This is particularly useful when you want Claude to focus on one specific task instead of trying to handle multiple things simultaneously. For example, if you ask Claude to write tests for multiple functions and it starts creating a comprehensive plan for all of them, you can interrupt and ask it to focus on just one function at a time.

## Combining Escape with Memories

One of the most powerful applications of the escape technique is fixing repetitive errors. When Claude makes the same mistake repeatedly across different conversations, you can:

- Press Escape to stop the current response
- Use the # shortcut to add a memory about the correct approach
- Continue the conversation with the corrected information

This prevents Claude from making the same error in future conversations on your project.

## Rewinding Conversations

During long conversations, you might accumulate context that becomes irrelevant or distracting. For instance, if Claude encounters an error and spends time debugging it, that back-and-forth discussion might not be useful for the next task.

You can rewind the conversation by pressing Escape twice. This shows you all the messages you've sent, allowing you to jump back to an earlier point and continue from there. This technique helps you:

- Maintain valuable context (like Claude's understanding of your codebase)
- Remove distracting or irrelevant conversation history
- Keep Claude focused on the current task

## Context Management Commands

Claude provides several commands to help manage conversation context effectively:

### /compact

The `/compact` command summarizes your entire conversation history while preserving the key information Claude has learned. This is ideal when:

- Claude has gained valuable knowledge about your project
- You want to continue with related tasks
- The conversation has become long but contains important context

Use compact when Claude has learned a lot about the current task and you want to maintain that knowledge as it moves to the next related task.

### /clear

The `/clear` command completely removes the conversation history, giving you a fresh start. This is most useful when:

- You're switching to a completely different, unrelated task
- The current conversation context might confuse Claude for the new task
- You want to start over without any previous context

## When to Use These Techniques

These conversation control techniques are particularly valuable during:

- Long-running conversations where context can become cluttered
- Task transitions where previous context might be distracting
- Situations where Claude repeatedly makes the same mistakes
- Complex projects where you need to maintain focus on specific components

By using escape, double-tap escape, `/compact`, and `/clear` strategically, you can keep Claude focused and productive throughout your development workflow. These aren't just convenience features: they're essential tools for maintaining effective AI-assisted development sessions.