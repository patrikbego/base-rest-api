# Pure Nodejs Rest API

This is pure Nodejs Rest API server (node v15.3.0). There is no need for `npm` or any other package manager and libraries. 
The project contains following services:  
`src/service/authService.js` - signup/signin api endopoints   
`src/service/cliService.js` - CLI for different server managment/analysis purposes   
`src/service/dataService.js` - data layer service (integrated with disk storage)  
`src/service/itemsService.js` - mock items store service  
`src/service/mailgunService.js` - Mailgun integration service  
`src/service/orderService.js` - mock orders store service  
`src/service/responseLogService.js` - log compressor service  
`src/service/stripeService.js` - Stripe compressor service  
`src/service/tokenService.js` - sec token service   
`src/service/userService.js` - user service  
&nbsp;  
`src/routeHandler.js` - "proxy" for all api's   
`src/utils.js` - util library   
`index.js` - main executable (starts rest api, workers and cli). It start the http server on port 3005 and https on 3010  
`index-cluster.js` - clustered/per cpu main executable  
`config.js` - config properties for different environments  

&nbsp;  
&nbsp;  

### Run the project  
`node index.js`  or `node index-cluster.js ` for clustered version


### Create Certificate
Locally you should create certificate with openssl: 
```shell
openssl req -x509 -out localhost.crt -keyout localhost.key \
-newkey rsa:2048 -nodes -sha256 \
-subj '/CN=localhost' -extensions EXT -config <( \
printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```
When you have certificate update `rest-api.js` with the paths to the key and certificate.
