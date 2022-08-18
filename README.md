# About The Project

This project was part of an interview process at an unnamed company.

# Install and Setup

First, make sure you've got those apps installed:

- Node >= 16.0
- MongoDB Community edition, latest version: https://docs.mongodb.com/manual/administration/install-community/

To get started you `.env` must contain the following
```Shell
  # SHARED
  ENV_NAME=dev
  API_URL=http://localhost:5100/api
  PORT=5100
  SESSION_SECRET=<type your special random key of alphanumeric characters here>

  # MONGO
  MONGODB_URI=mongodb://localhost:27017/test-local
```

To test the endpoints use the extension called `Rest Client` the file named `requests.rest`

# Usage

To run the app in dev mode use:

`npm run prod`

To run the app in prod mode use:

`npm run dev`

To run the tests use (also includes coverage report):

`npm run test`

# Design rationale

I chose to modify the database as follows:
* The artist table will include the `lastPaidAt` date representing a the last time the artist was paid
* The artist table will include the `paidStreams` representing the last count at which the artist was paid
* The artist DTO will include a variable called `currentPayStatus` detailing whether or not the artist was paid this will be when `streams > paidStreams` and `period since then > 2 weeks`
* To optimize performance and reduce complexity, I chose to do `single table design` and store artists and rates within the same collection
* To simplify design, I will assume that the rate change will proactivvely affect the monthly i.e. we won't keep track of each individual month. Rather, the average will be calculate using `(rate * paidStreams) / months since inception` 

## Other assumptions and design decisions:

* I will assume that all users will be accountants (who can do payouts and change rates).
* I will assume that changing the artists names falls outside the role of accountant 
  so no CRUD methods to take care of that.

## Not taken care of:
* Invalidating the user/logging out when page is visited after cookie expired 
* On the frontend side, I assumed that the refund is outside the requirements
* I also assumed that the accountant paying will be sure (so no modal for confirmation of payment) 
 
