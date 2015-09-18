## Llamas On The Loose Static Site Repo

### TODO's
* Create field in slideshow table for active project
* Show an alert at the top of the screen with a link
  to see the current project we are working on

#### Technologies
* Gulp (Build Tool)
* Bower (JS Library Package Management)
* LESS (CSS Preprocessor)
* AngularJS (Client-side MVC Framework)
* Twitter Bootstrap (Responsive Design and Widgets)
* Third-party utility Libraries:
    * Lo-dash - JS Array and Object Utilities
    * moment.js - Time Manipulation and Formatting 


#### Updates
* 6.1.2015 
    * Separated Backend from Front-end.  This repo is just static files (JS, CSS, HTML).
    * There is a separate repo named `levsdelight4` which handles the api calls using Django.
    * CSS is generated with a LESS preprocessor and is mostly `Twitter Bootstrap` based.
    * Fullscreen directive has been implemented for viewing pictures


* 7.16.2015
    * Change algorithim for displaying main page slideshows
      from just using a regex to incorporating the monthmap.
      Much more stable this way.
    * Clicking title takes you to the main page

* 8.10.2015
    * Base Authentication

* 9.18.2015
    * Admin Toolbar
    * Rearrange Slides with Drag and Drop
    * Edit Title/Description
