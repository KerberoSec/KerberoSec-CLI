# Site Map And Issue Definitions

- Control of the scope may be the most useful aspect of the Target tab, but it's by no means the only use for this section of Burp.

- #### There are three sub-tabs under Target:

   - **Site Map:** allows us to map out the apps we are targeting in a tree structure. Every page that we visit will show up here, allowing us to automatically generate a site map for the target simply by browsing around the web app. Burp Pro would also allow us to spider the targets automatically (i.e. look through every page for links and use them to map out as much of the site as-is publicly accessible using the links between pages); however, with Burp Community, we can still use this to accumulate data whilst we perform our initial enumeration steps.
   The Site map can be especially useful if we want to map out an API, as whenever we visit a page, any API endpoints that the page retrieves data from whilst loading will show up here<br>
   
   - **Scope:** We have already seen the Scope sub-tab: it allows us to control Burp's target scope for the project.<br>
   
   - **Issue Definitions:** Whilst we don't have access to the Burp Suite vulnerability scanner in Burp Community, we do still have access to a list of all the vulnerabilities it looks for. The Issue Definitions section gives us a huge list of web vulnerabilities (complete with descriptions and references) which we can draw from should we need citations for a report or help describing a vulnerability.

# Answer the questions below

1. Take a look around the site on [http://MACHINE_IP/](): we will be using this a lot throughout the module. Visit every page linked to from the homepage, then check your sitemap: one endpoint should stand out as being very unusual!

Visit this in your browser (or use the "Response" section of the site map entry for that endpoint)

What is the flag you receive?
```
THM{NmNlZTliNGE1MWU1ZTQzMzgzNmFiNWVk}
```
2. Look through the Issue Definitions list.

What is the typical severity of a Vulnerable JavaScript dependency?
```
Low
```
