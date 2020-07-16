## Personal Book Library

This project is a self-created website that allows one to input books into their own personal library.

It has completed all the requirements of the FCC [Information Security and Quality Assurance Projects - Personal Library](https://www.freecodecamp.org/learn/quality-assurance/quality-assurance-projects/personal-library)
project.

### Acknowledgements

I would like to thank W3Schools and MDN for their easy to understand guides that are easily accessible online. They helped me greatly while trying to improve on the UI
of this project.

Moreover, I would like to thank [PureCSS](https://purecss.io/) for its small but useful CSS library that is sufficient for my project. The minimalist aspect makes it
a perfect candidate for this book library.

### Getting Started

You can follow the instructions to get this project running locally.

```
1. Git clone or download this project
2. npm install (Node v10+)
3. Create a .env file and prepare the following variables:
NODE_ENV, DB and DB_TEST
4. NODE_ENV can be set to 'test' to run backend tests;
DB and DB_TEST are MongoDB connection URI for production
and testing respectively.
5. npm start
```

To run locally, you need to set up the 'dotenv' package using `npm i dotenv` followed by including `require('dotenv').config()` in routes/api.js file.

### Supported Browsers

This project is tested working on Firefox 75.0+ (beta), Chrome 80+ and Edge 44+.

However, IE is not supported because ES6 / ES7 features are used in the javascript. No polyfills are included in this project.

Please contact me should there be any discrepancies found.
