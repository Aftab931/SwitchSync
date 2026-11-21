
# SwitchSync

A first-year engineering CTI project: a web-based smart-home monitoring and control simulation.

## Features

- Dashboard for 20 household appliances.
- Appliance ON/OFF simulation.
- Home Mode and Away Mode.
- Travel Mode with departure and return dates.
- Travel planning and appliance safety checklist.
- Switch-all-appliances-OFF option for travel preparation.
- Automatic date, weekday and greeting updates.
- Smart alerts for appliances running for a long time.
- Estimated electricity consumption and cost.
- Activity log.
- Dark and light theme.
- Admin profile panel.
- Local storage to preserve simulated device states and trip plans.

## Technologies Used

- HTML5 – Website structure.
- CSS3 – Styling, layout and responsive design.
- JavaScript – Appliance controls, calculations, date updates and Travel Mode.
- LocalStorage – Saving website settings and simulation data.
- Node.js and Express – Local backend.

## How to Run Locally

1. Install Node.js LTS from https://nodejs.org/
2. Open the SwitchSync project folder in VS Code.
3. Open the terminal.
4. Run:

   npm install

5. Start the project:

   npm start

6. Open the following address:

   http://localhost:3000

7. Stop the server using Ctrl + C.

## Travel Mode

Travel Mode allows users to enter their departure and return dates, save trip information and review the status of household appliances.

The user can activate Travel Mode and switch all simulated appliances OFF before leaving.

The Travel Checklist displays which appliances are ON and OFF.

## Dynamic Date and Greeting

The dashboard automatically displays the current weekday, date, month and year.

The greeting changes according to the system's current time:

- Good morning
- Good afternoon
- Good evening
- Good night

## Important Academic Note

SwitchSync is a software simulation. It does not directly control real household electrical appliances.

Travel Mode, appliance controls, energy calculations and alerts are simulated using JavaScript and browser storage.

A future version could connect the dashboard to authenticated IoT hardware APIs for real appliance monitoring and control.
