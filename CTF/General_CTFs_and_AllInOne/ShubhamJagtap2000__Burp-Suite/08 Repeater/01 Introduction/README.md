# What Is a Repeater?

- **In short:** Burp Suite Repeater allows us to craft and/or relay intercepted requests to a target at will. In layman's terms, it means we can take a request captured in the Proxy, edit it, and send the same request repeatedly as many times as we wish. Alternatively, we could craft requests by hand, much as we would from the `CLI (Command Line Interface)`, using a tool such as cURL to build and send requests.

- This ability to edit and resend the same request multiple times makes Repeater ideal for any kind of manual poking around at an endpoint, providing us with a nice `Graphical User Interface (GUI)` for writing the request **payload** and numerous views (including a rendering engine for a graphical view) of the response so that we can see the results of our handiwork in action. 

# Repeater Dashboard

- #### The Repeater interface can be split into **six** main sections: an annotated diagram can be found below the following bullet points:

    - At the very top left of the tab, we have a list of Repeater requests. We can have many different requests going through Repeater: each time we send a new request to Repeater, it will appear up here.

    - Directly underneath the request list, we have the controls for the current request. These allow us to send a request, cancel a hanging request, and go forwards/backwards in the request history.
    
    - Still on the left-hand side of the tab, but taking up most of the window, we have the request and response view. We edit the request in the Request view then press send. The response will show up in the Response view.
    
    - Above the request/response section, on the right-hand side, is a set of options allowing us to change the layout for the request and response views. By default, this is usually side-by-side (horizontal layout, as in the screenshot); however, we can also choose to put them above/below each other (vertical layout) or in separate tabs (combined view).
    
    - At the right-hand side of the window, we have the Inspector, which allows us to break requests apart to analyse and edit them in a slightly more intuitive way than with the raw editor. We will cover this in a later task.
    
    - Finally, above the Inspector we have our target. Quite simply, this is the IP address or domain to which we are sending requests. When we send requests to Repeater from other parts of Burp Suite, this will be filled in automatically.

        ![Screenshot (808)](https://user-images.githubusercontent.com/63872951/182324981-3450bbd5-257d-4bbd-84a5-dbd3e172d3e8.png)
