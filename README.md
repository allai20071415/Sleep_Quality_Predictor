# 🌙 Sleep Quality Predictor

A responsive web app that predicts sleep quality (**Good / Average / Poor**) from daily habits, and adapts its advice to your work pattern.

## Features
- Predicts sleep quality from sleep duration, bedtime, wake-up time, caffeine, exercise, screen time, stress, mood and interruptions
- **Tiredness level** slider (0-10)
- **Work schedule**: day, night, rotating, flexible/remote, physically demanding
- **Work hours and commute** inputs
- **Work-aware sleep recommendation**: a suggested sleep range based on work pattern and tiredness
- **Smart recovery plan**: practical actions based on tiredness, sleep quality and schedule
- Personalized tips, reset button, and a history table with trend chart (saved in the browser)
- Light and dark theme, mobile friendly

## Project structure
```
sleep-quality-predictor/
├── index.html
├── css/style.css
├── js/app.js        # scoring rules, recommendations, history
├── .vscode/settings.json
├── .gitignore
├── LICENSE
└── README.md
```

## Run in VS Code
1. Unzip the folder and open it in VS Code (File > Open Folder).
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` and choose **Open with Live Server**.

No build step or dependencies. You can also just double-click `index.html`. An internet connection is only needed for the Poppins font (it falls back to system fonts).

## Upload to GitHub
```bash
cd sleep-quality-predictor
git init
git add .
git commit -m "Initial commit: Sleep Quality Predictor"
git branch -M main
git remote add origin https://github.com/<your-username>/sleep-quality-predictor.git
git push -u origin main
```
To host it free: repo Settings > Pages > Deploy from branch > main / root.

## How the prediction works
A transparent rule-based score (0-100): 75+ is Good, 50-74 is Average, below 50 is Poor. Penalties apply for sleep outside your recommended range, caffeine, low exercise, screen time, stress, mood, interruptions and unrefreshing sleep. Rules live in `js/app.js` and are easy to tune.

## Roadmap
- Replace the rules with a trained scikit-learn model (Logistic Regression, Random Forest, SVM) using the Kaggle Sleep Health and Lifestyle dataset
- Optional NLP on sleep diary notes

## Disclaimer
For habit guidance only, not medical advice.
