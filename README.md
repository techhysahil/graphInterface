# For Running Inline build:
In this build, all the files(DOM+JS+CSS) are combined into one single index.html file and served to the browser.

In this version, app is properly working but improvement can be made further by adding external js and css.

To run this version of app, follow below instructions:
## Step 1:
```javascript
Clone Angular app : git clone https://github.com/techhysahil/angular-graph-control.git
Clone React app : git clone https://github.com/techhysahil/graph-control.git
Clone Final App :  git clone https://github.com/techhysahil/graphInterface.git
``` 

## Step 2:
For Angular app, enter directory and run following command :
```javascript
npm install 
npm run build:ssr && npm run serve:ssr
``` 

For React App, enter directory and run following command :
```javascript
npm install 
npm run start:prod
``` 

For Final APP, First switch into "serverSide" branch and run following command :
```javascript
npm install 
node server.js
``` 

You app will be up and running on http://localhost:9000/



