// index.js


const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const AWS = require('aws-sdk')


const USERS_TABLE = process.env.USERS_TABLE
const dynamoDb = new AWS.DynamoDB.DocumentClient()

app.use(bodyParser.json({ strict: false }))

app.get('/', function (req, res) {
	res.send('Demo users API!')
})

// Get User endpoint
app.get('/users/:userId', function (req, res) {
	const params = {
		TableName: USERS_TABLE,
		Key: {
			userId: req.params.userId,
		},
	}

	dynamoDb.get(params, (error, result) => {
		if (error) {
			console.log(error)
			res.status(400).json({ error: 'Could not get user' })
		}
		if (result.Item) {
			const { userId, name, mail } = result.Item
			res.json({ userId, name, mail })
		} else {
			res.status(404).json({ error: "User not found" })
		}
	})
})

// Get all users endpoint
app.get('/users/', function (req, res) {
	const params = {
		TableName: USERS_TABLE,
		Limit: 50000
	}

	dynamoDb.scan(params, (error, result) => {
		if (error) {
			console.log(error)
			res.status(400).json({ error: 'Could not get all users' })
		}
		if (result) {
			res.json(result)
		}
	})
})

// Create User endpoint
app.post('/users', function (req, res) {
	const { userId, name, mail } = req.body
	if (typeof userId !== 'string') {
		res.status(400).json({ error: '"userId" must be a string' })
	} else if (typeof name !== 'string') {
		res.status(400).json({ error: '"name" must be a string' })
	} else if (typeof mail !== 'string') {
		res.status(400).json({ error: '"mail" must be a string' })
	}

	const params = {
		TableName: USERS_TABLE,
		Item: {
			userId: userId,
			name: name,
			mail: mail
		},
	}

	dynamoDb.put(params, (error) => {
		if (error) {
			console.log(error)
			res.status(400).json({ error: 'Could not create user' })
		}
		res.json({ userId, name, mail })
	})
})

module.exports.handler = serverless(app)

/* 
endpoints:
  ANY - https://85u4t74xg7.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://85u4t74xg7.execute-api.us-east-1.amazonaws.com/dev/{proxy+}

  functions:
  app: express-api-dev-app

export BASE_DOMAIN=https://85u4t74xg7.execute-api.us-east-1.amazonaws.com/dev

curl -H "Content-Type: application/json" -X POST ${BASE_DOMAIN}/users -d '{"userId": "cbroberg", "name": "Christian Broberg"}'
{"userId":"cbroberg","name":"Christian Broberg"}

curl -H "Content-Type: application/json" -X POST ${BASE_DOMAIN}/users -d '{"userId": "hhansen", "name": "Henrik Hansen", "mail": "hh@webhouse.dk"}'
{"userId": "hhansen", "name": "Henrik Hansen", "mail": "hh@webhouse.dk"}

*/