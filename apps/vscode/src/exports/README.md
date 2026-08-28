# KerberoSec API

The KerberoSec extension exposes an API that can be used by other extensions. To use this API in your extension:

1. Copy `src/extension-api/kerberosec.d.ts` to your extension's source directory.
2. Include `kerberosec.d.ts` in your extension's compilation.
3. Get access to the API with the following code:

    ```ts
    const kerberosecExtension = vscode.extensions.getExtension<KerberoSecAPI>("saoudrizwan.claude-dev")

    if (!kerberosecExtension?.isActive) {
    	throw new Error("KerberoSec extension is not activated")
    }

    const kerberosec = kerberosecExtension.exports

    if (kerberosec) {
    	// Now you can use the API

    	// Start a new task with an initial message
    	await kerberosec.startNewTask("Hello, KerberoSec! Let's make a new project...")

    	// Start a new task with an initial message and images
    	await kerberosec.startNewTask("Use this design language", ["data:image/webp;base64,..."])

    	// Send a message to the current task
    	await kerberosec.sendMessage("Can you fix the @problems?")

    	// Simulate pressing the primary button in the chat interface (e.g. 'Save' or 'Proceed While Running')
    	await kerberosec.pressPrimaryButton()

    	// Simulate pressing the secondary button in the chat interface (e.g. 'Reject')
    	await kerberosec.pressSecondaryButton()
    } else {
    	console.error("KerberoSec API is not available")
    }
    ```

    **Note:** To ensure that the `saoudrizwan.claude-dev` extension is activated before your extension, add it to the `extensionDependencies` in your `package.json`:

    ```json
    "extensionDependencies": [
        "saoudrizwan.claude-dev"
    ]
    ```

For detailed information on the available methods and their usage, refer to the `kerberosec.d.ts` file.
