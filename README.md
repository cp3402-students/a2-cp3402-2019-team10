# The Coffee Can Cafe
*JCU Cairns, 2019 SP1, CP3402 A2, Team 10*

## Authors
 - [Matthew Livingston](https://github.com/blubrick)
 - [Ady (Ye Thiha Aung)](https://github.com/AdyAung)
 - [Yvan Burrie](https://github.com/jc444304)
 - [Anthony Vincin](https://github.com/AnthonyV01)
 - [Stephen Ohl](https://github.com/StephenOhl)

## Server
 - Domain: [notdotcom.fun](https://notdotcom.fun/)
 - Address: [139.162.34.109](139.162.34.109)
 - Ubuntu 18.04
 - Apache 2.4.29
 - MySQL 5.7.25
 - PHP 7.2.15

## Workflow
 - Development:
   - [PhpStorm](https://www.jetbrains.com/phpstorm/)
 - Collaboration:
   - [Slack](https://itatjcu.slack.com/messages/GA1QLQCEB/)
   - [GitHub](https://github.com/cp3402-students/a2-cp3402-2019-team10/)
   - [Slack + Github Integration](https://slack.github.com/)
   - ~~[Trello](https://trello.com/b/CXd946x3/scrum-board)~~: Using GitHub projects as of 9th of May (see below)...
   - [Github Projects](https://github.com/cp3402-students/a2-cp3402-2019-team10/projects)
 - Deployment:
   - [Git](https://git-scm.com/): via command line, PhpStorm VCS, GitHub Desktop, etc...
   - [Github webhook](https://github.com/cp3402-students/a2-cp3402-2019-team10/settings/hooks/106278049)
   - [Our own utility](https://github.com/cp3402-students/a2-cp3402-2019-team10/blob/master/work/index.php)

## WordPress
 - Version: [5.1.1](https://wordpress.org/support/wordpress-version/version-5-1-1/)
 - Themes:
   - [Understrap](https://understrap.com/)
 - [Production Site](https://notdotcom.fun/wp/)
   - Database name: `prod`
 - [Staging Site](https://notdotcom.fun/staging/)
   - Database name: `staging`
 - Plugins:
   - [WooCommerce](https://woocommerce.com/)
   - [WP Forms](https://wpforms.com/)
   - [Smart Slider](https://smartslider3.com/)
   - [Instagram Gallery](https://wordpress.org/plugins/insta-gallery/)

## Developer setup
The following instructions are based on using basic Unix commandline tools.  If you are using a graphical interface to git, you will need to adjust these instructions accordingly. 
 - Initially, install WordPress on your development environment.  
 - Issue the following commands to clone the github repository into your development environment's wordpress installation 
   - Change into the wp-content/themes directory
     - `cd `<WordPress-installation-directory>`/wp-content/`
   - Create an empty git repository
     - `git init`
   - Set the github repository as a remote repository
     - `git remote add origin https://github.com/cp3402-students/a2-cp3402-2019-team10`
   - Retrieve the remote repository data into git
     - `git fetch`
   - Reset the git repository to a known status
     - `git reset origin/master`
   - re-create the files from the repository data
     - `git checkout .`
   - Define the target of the push command
     - `git push --set-upstream origin master`
   -  Add to the file `.git/info/exclude` any filenames you do not want included in the repository
    
 - On your development server (be it WAMPP, Vagrant or other), any time you make a change to files under the git repository, 
   - Add all modified and newly-created files to the next commit 
     - `git add .`
   - Commit and push your recent changes
     - `git commit -m "Useful commit message"`
     - `git push` 

## Deployment
 - Log in to `your_username@cp3402.notdotcom.fun` via SSH.
 - Run the command `cp3402deploy` which performs the following:
   - Changes to the staging site's `wp-content/themes/` directory.
   - Performs a `git pull` to sync the local repository with the version stored on github.
   - Prints a message containing the URL of the site.
   
test change - push from phpstorm
