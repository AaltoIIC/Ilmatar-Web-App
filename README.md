# Ilmatar web app

Web application backend built with [Flask](https://www.palletsprojects.com/p/flask/).

Built to work with [Ilmatar HTTP Wrapper](https://github.com/AaltoIIC/OPC-UA-GraphQL-Wrapper) -GraphQL API.

## Introduction
An user interface designed for the Ilmatar crane. The web app distributes small independent JavaScript applications found in the server static files. The JavaScript apps can use data from the Ilmatar OPC UA server via the GraphQL API, or from any web accessible resources.

For now, JavaScript apps are divided to monitor scripts and control scripts. Monitor scripts can show data to the user by monitoring sensor values or devices such as the on-crane web camera. Control scripts can control the crane in various ways. Additional scripts can be created and integrated to the web app.

**Monitor** scripts included for now are position, condition, camera and advanced applications. In advanced, the user can monitor any combination of sensors/nodes from the Ilmatar OPC UA server.

**Control** scripts included for now are control and marvel mind applications. The web app attempts to give only one user at a time access to the crane controls. This, however, is easily circumvented and should not be relied on. In addition to the control scripts, the web app runs the required watchdog and access code functions in the background once the user has been granted controls.

## Installation

Clone the repository

```
git clone https://version.aalto.fi/gitlab/hietalj3/ilmatar-web-app.git
```

Browse to cloned project's folder. (Suggested to use virtualenv for following).

```
pip install -r requirements.txt
```

#### Setup
Change apiUrl variable in **IlmaWebApp\templates\index.html** to the Ilmatar's GraphQL API URL if necessary.

```
var apiUrl = "http://192.168.0.77/graphql";
```

#### Starting the flask app locally
(In virtualenv, if used)

Windows CMD:

```
> python IlmaWebApp\wsgi.py
```

Unix Bash:
```
$ python IlmaWebApp/wsgi.py
```

Application is now available at host device IP-address via port 5000

```
http://xxx.xxx.xxx.xxx:5000
```
## Adding control or monitoring apps
If you have any control or monitoring apps you want to add to the application (JavaScript and maybe CSS), create a folder for the app add them to corresponding static folders.

Add a monitoring app to folder:
```
IlmaWebApp\static\apps\monitor\<app_name>\<app_name>.js     # JavaScript
IlmaWebApp\static\apps\monitor\<app_name>\<app_name>.css    # CSS
```
Control apps are similarly added to folder:
```
IlmaWebApp\static\apps\control\
```

Restart or redeploy the app.

The application has [jQuery](https://api.jquery.com/), [Bootstrap](https://getbootstrap.com/docs/4.4/getting-started/introduction/) and [Material Icons](https://material.io/resources/icons/?style=baseline) included, which can be used when building and styling new app interfaces. Some predefined styles for basic html elements are set in **IlmaWebApp/static/css/style.css**.

## Deploying the flask app to Raspberry Pi server
A good guide on deploying the app can be found from
[Here](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-18-04)

## Redeploying the flask app to (existing) Raspberry Pi server
Use Ubuntu bash to run [redeployToRaspPi.sh](https://version.aalto.fi/gitlab/hietalj3/ilmatar-web-app/blob/master/redeployToRaspPi.sh) script (Don't move the script from its location).
You may need to adjust the script if starting your own Raspberry Pi server, instead of the one already configured for Ilmatar.

You need to be connected to the Ilmatar network.

```
$ ./redeployToRaspPi.sh
```