# CS50’s Web Programming with Python and JavaScript - HarvardX online course
# Final project: Color War
14/08/2020
## Web description
The web application consists in a war between two teams. Each new user must join a team (blue or red). Each team has its own warriors which are created by the members of the team itself. When a team wishes to do it, it can engage a battle, where the winner will be obtained "randomly" but proportional to the total warrior strength of each team. That is, the more global strength, the more chances to win. At each battle, every warrior loses 20 HP and its age increases in 10. When the HP reaches 0 or the age reaches 100, the warrior dies. Warrior strength can be updagraded by every member of the team, and HP can be restored as well, but age cannot. To create a warrior, a user must solve correctly 10 math calculations as challenge. To upgrade a warrior, a 1pt increase in any feature will supose 1 math calculation to solve. For a better understanding, see the video demonstration below.

## Video demonstration:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/JZOHD0KIwew/0.jpg)](https://youtu.be/JZOHD0KIwew)


## Files explanation
This web application uses Django (Python), HTML, CSS, JavaScript and React.
- **Statics**
    - **styles.css**
    Contains the classes and styles used on different web parts
    - **Javascript files**
    A set of javascript files which define the fron-end behavior of the views.
- **Templates**
    HTML templates in which the javascript files are inserted. For every diferent "main" page, a new template is used which calls a different (or not) javascript file.
All HTML templates extend 'layout.html', which contains the main upper navigation bar.

- **Django generated files**
    - **models**
    Contains 5 models: User, Warrior, Team, Contribution, Battle
    - **views**
    Manages the back-end web behavior
    - **urls**
    Contains the path to the views to render the templates and to the API's to fetch data from.
    - **admin**
    Registers the models in order to be able to manipulate them from the django admin web interface. 