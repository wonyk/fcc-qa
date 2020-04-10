## Stock Price Checker

This project is made as part of [Free Code Camp Information Security and Quality Assurance Projects #4](https://www.freecodecamp.org/learn/information-security-and-quality-assurance/information-security-and-quality-assurance-projects/stock-price-checker)

It has fulfilled all the necessary requirements, user stories and testing.

### Getting Started

To begin, you will need the following prerequesites:

1. NodeJS 10.15.x and above
2. MongoDB Atlas (recommended) DBaaS set up

You may follow the instructions to set up the project:

```
1. git clone or download this project
2. set up .env file: NODE_ENV, DB_URL, DB_TEST, PORT
3. npm install
4. npm start
5. The project will be ready at localhost:PORT
```

### Testing

For testing, you will need to set NODE_ENV to 'test'. The test will run on a seperate database you entered for the DB_TEST variable, thus it will not affect your main database and software.

### Acknowledgments

I would like to thank MDN and W3Schools for their long-time trusted resources for all the front-end web development tools.

Also, I believe [bootstrap](https://getbootstrap.com/) deserves my great respect for their wonderful, elegant and beautiful yet simplistic designs and utilities to make this project possible. It has withstand the trial of time to maintain as one of the best CSS frameworks.

Lastly, thanks to jQuery for making the javascript(ing) and DOM manipulations a breeze.

### Browser Support

The project has been tested to work on Firefox 75.0+ (beta), Chrome 80+, Edge 80+.

However, IE is not supported since ES6+ syntax is used and I did not incorporate any polyfill or Babel to allow it to work in IE.
