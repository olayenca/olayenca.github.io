const config = require('dotenv').config().parsed.NODE_ENV;

describe('Node Env', function() {
    it('should be in dev mode', function() {
        expect(config).toEqual('dev');
    });
});
