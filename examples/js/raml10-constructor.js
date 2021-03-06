/**
 * Example of constructing RAML 1.0 API from scratch.
 */
const lib = require('webapi-parser')
const wap = lib.WebApiParser

async function main () {
  // Init WebApiParser to set up necessary plugins
  await wap.init()

  // Create API instance with title, description, protocols, mediaType,
  // 'accepts' list and version
  const api = new lib.model.domain.WebApi()
    .withName('Foo org API')
    .withDescription('Describes Foo org API')
    .withSchemes(['http', 'https'])
    .withContentType(['application/json'])
    .withAccepts(['application/json'])
    .withVersion('1.1')

  // Set baseUrl
  api.withServer('foorg.bar/{version}')

  // Create endpoint with path /users, title and description
  const users = api.withEndPoint('/users')
  users.withName('Users endpoint').withDescription('Lists users')

  // Create method GET /users with title
  const getUsers = users.withOperation('get')
  getUsers.withName('GET Users')

  // Create 500 response to GET /users
  const getUsers500Resp = getUsers.withResponse('500')

  // Create GET /users 500 response payload of content type 'text/plain' and
  // data type of 'string'
  const getUsers500Payload = getUsers500Resp.withPayload('text/plain')
  const getUsers500Schema = getUsers500Payload.withScalarSchema(
    '500ErrorMessage')
  getUsers500Schema.withDataType('http://www.w3.org/2001/XMLSchema#string')

  // Create 200 response to GET /users
  const getUsers200Resp = getUsers.withResponse('200')

  // Create GET /users 200 response payload of content type 'application/json'
  // with schema
  const getUsers200Payload = getUsers200Resp.withPayload('application/json')
  const getUsers200Schema = getUsers200Payload.withObjectSchema('schema')
  getUsers200Schema
    .withName('Users')
    .withClosed(false)

  // Create required 'username' schema property of type 'string'
  const userNameScalar = new lib.model.domain.ScalarShape()
    .withDataType('http://www.w3.org/2001/XMLSchema#string')
  const userName = getUsers200Schema
    .withProperty('username')
    .withPath("http://a.ml/vocabularies/data#name")
    .withMinCount(1)
    .withRange(userNameScalar)

  // Create required 'email' schema property of type 'string'
  const userEmailScalar = new lib.model.domain.ScalarShape()
    .withDataType('http://www.w3.org/2001/XMLSchema#string')
  const userEmail = getUsers200Schema
    .withProperty('email')
    .withMinCount(1)
    .withPath('http://a.ml/vocabularies/data#email')
    .withRange(userEmailScalar)

  // Create endpoint /users/{id}
  const user = api.withEndPoint('/users/{id}')
  user.withName('User endpoint').withDescription('Get user')

  // Create document with the constructed API
  const model = new lib.webapi.WebApiDocument().withEncodes(api)

  // Generate RAML 1.0 string from the document
  const generated = await wap.raml10.generateString(model)
  console.log('Generated from constructed:\n', generated)
}

main()
