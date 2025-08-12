# Gui

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) 
v20.19.3

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.



# Create project
ng new <project-name>

# Install components UI
npm install primeng @primeng/themes

npm install primeicons

npm install primeflex. (para utilidades css)

## Desarrollador
- CORTES CORTES BRYAN AXEL

# Install components in the WSL
ng generate component shared/components/header

frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── auth.interceptor.ts
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── task.model.ts
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   ├── login.component.css
│   │   │   │   ├── register/
│   │   │   │   │   ├── register.component.ts
│   │   │   │   │   ├── register.component.html
│   │   │   │   │   ├── register.component.css
│   │   │   │   ├── auth.routes.ts
│   │   │   ├── tasks/
│   │   │   │   ├── task-list/
│   │   │   │   │   ├── task-list.component.ts
│   │   │   │   │   ├── task-list.component.html
│   │   │   │   │   ├── task-list.component.css
│   │   │   │   ├── task-create/
│   │   │   │   │   ├── task-create.component.ts
│   │   │   │   │   ├── task-create.component.html
│   │   │   │   │   ├── task-create.component.css
│   │   │   │   ├── tasks.service.ts
│   │   │   │   ├── tasks.routes.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   │   ├── header.component.ts
│   │   │   │   │   ├── header.component.html
│   │   │   │   │   ├── header.component.css
│   │   │   ├── shared.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   ├── app.routes.ts
│   ├── assets/
│   ├── styles.css
│   ├── main.ts
│   ├── index.html
├── angular.json
├── package.json
├── tsconfig.json

## Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu_usuario/nombre_proyecto.git
   cd nombre_proyecto
