import app from './index.js';


const port = process.env.PORT || 2020;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});