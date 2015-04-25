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
  
Browser based unit testing and manual testing 
---------------------------------------------
Browser based unit testing is currently required to test Internet Explorer compatibility.
Run:  
>grunt test-server  

This will start the test HTTP server and print the URLs of both the unit test site and the manual test/fiddle site.

 
