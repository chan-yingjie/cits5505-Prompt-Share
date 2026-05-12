# Prompt Share

Prompt Share is a Flask web application for discovering, submitting, and discussing useful AI prompts. The application is designed as a small community platform where users can create accounts, publish prompts, browse database-backed prompt cards, view prompt details, and leave persistent comments.

The current design keeps the user interface simple and task-focused. The feed page presents prompt cards from the database, the detail page shows the full prompt content and comments, the submit page lets authenticated users publish new prompts, and the profile page shows user-specific prompt content. Some frontend-only features, such as likes, favourites, sharing, search filters, pagination, avatar uploads, and profile editing, are visible or prepared for future backend integration.

## Group Members

| UWA ID | Name | GitHub username |
| --- | --- | --- |
| 24262634 | Qian Yingjie | chan-yingjie |
| 24771727 | Armin Islam | TODO |
| 23864156 | Chinmai Ravindran | TODO |

## Launch Instructions

1. Clone the private GitHub repository and enter the project directory.

   ```bash
   git clone <private-repository-url>
   cd cits5505-git-practice
   ```

2. Create and activate a virtual environment.

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

   On Windows:

   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies.

   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations.

   ```bash
   flask db upgrade
   ```

5. Start the development server.

   ```bash
   python run.py
   ```

6. Open the application in a browser.

   ```text
   http://127.0.0.1:5000
   ```

## Test Instructions

The project currently uses manual smoke testing and Python compilation checks. Run these commands before committing changes:

```bash
python -m compileall app
git diff --check
```

Recommended manual smoke test flow:

1. Open `/feed` and confirm database-backed prompt cards are displayed.
2. Open a prompt detail page and confirm the title, author, category, body, output preview, and comments render correctly.
3. Sign up or log in.
4. Submit a new prompt from `/submit-prompt`.
5. Return to `/feed` and confirm the new prompt appears.
6. Add a comment on a prompt detail page and confirm it persists after refresh.
7. Open the logged-in user's profile and confirm submitted prompts are shown.

If automated tests are added later, place them in a `tests/` directory and run:

```bash
pytest
```
