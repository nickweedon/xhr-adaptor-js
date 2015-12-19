xhr-adaptor-js
==============

Building
--------
1. Download and install npm (under windows install nodejs)
2. Run:'npm install -g grunt-cli'  
*(NB: Some modules will fail to install if running this command from Cygwin or if running from cmd but using a Cygwin version of git)*
3. Within this directory run 'npm install'
4. Run 'grunt'

Command line unit testing
-------------------------
Run:  
>grunt test

TODO
----
* FakeServer - Create new XHRWrapper derived class that allows you to return responses (like expect -> return this). Needed to unit test SAML client.
* CORS XHRWrapper - A CORS XHRWrapper would be a cool idea.
* Transparent ajax redirector - This would be a neat idea since you could redirect to a 'redirector' type plugin/thing
  on the server and then have it redirect to the real server, preventing the need for CORS.
