# Notes: Flask & Security Observations

## Flask Setup
- Requires defining an application entry point via environment variable
- Runs on a local development server by default
- Default port is configurable

## Routing
- Defined using decorators
- Maps URLs to backend functions
- Supports multiple endpoints within a single application

## HTTP Methods
- GET: Default method for retrieving data
- POST: Used for submitting data
- Flask allows method-specific handling within routes

## Template Engine (Jinja2)
- Used for rendering dynamic HTML
- Syntax includes {{ }} for variables
- Direct use of user input in templates is dangerous

## File Upload Handling
- Managed via request.files
- Uploaded files can be stored on the server
- Requires proper validation to avoid abuse

## Security Observation
- Improper template handling leads to SSTI
- SSTI can expose internal variables and system-level data
- Can escalate to file access if backend functions are exposed
