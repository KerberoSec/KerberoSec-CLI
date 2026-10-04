# Inspector

- Inspector is entirely supplementary to the request and response fields of the Repeater window. If you understand how to read and edit HTTP requests, then you may find that you rarely use Inspector at all.

- That said, it is a superb way to get a prettified breakdown of the requests and responses, as well as for experimenting to see how changes made using the higher-level Inspector affect the equivalent raw versions.

- Inspector can be used in the Proxy as well as Repeater. In both cases, it appears over at the very right hand side of the window and gives us a list of the components in the request and response:

  ![Screenshot (813)](https://user-images.githubusercontent.com/63872951/182870278-7d307e7c-e7a0-44dc-ac46-59c9eb47ccef.png)

- Of these, the request sections can nearly always be altered, allowing us to `add`, `edit`, and `delete` items. 

- For example, in the Request Attributes section, we can edit the parts of the request that deal with location, method and protocol; e.g. changing the resource we are looking to retrieve, altering the request from `GET` to another `HTTP method`, or switching protocol from `HTTP/1` to `HTTP/2:`

  ![Screenshot (814)](https://user-images.githubusercontent.com/63872951/182870540-524a9fa2-455f-421f-89fb-d883581b8acd.png)

- The other sections available for viewing and/or editing are:

   **1. Query Parameters**, which refer to data being sent to the server in the URL. For example, in a `GET` request to `https://admin.tryhackme.com/?redirect=false`, there is a query parameter called `"redirect"` with a value of `"false"`.<br>
   
   **2. Body Parameters**, which do the same thing as Query Parameters, but for `POST` requests. Anything that we send as data in a `POST` request will show up in this section, once again allowing us to modify the parameters before re-sending.<br>
   
   **3. Request Cookies** contain, as you may expect, a modifiable list of the cookies which are being sent with each request.<br>
   
   **4. Request Headers** allow us to view, access, and modify (including outright adding or removing) any of the headers being sent with our requests. Editing these can be very useful when attempting to see how a webserver will respond to unexpected headers.<br>
   
   **5. Response Headers** show us the headers that the server sent back in response to our request. These cannot be edited (as we can't control what headers the server returns to us!). Note that this section will only show up after we have sent the request and received a response.<br>
   
- These components can all be found as text within the request and response sections; however, it can be nice to see them in the tabular format offered by Inspector. It is well worth adding, removing, and editing headers in Inspector to get a feel for how the raw version changes as you do so.
