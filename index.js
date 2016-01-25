var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://api.tumblr.com/v2/'
});

var pickInputs = {
        'base-hostname': 'base_hostname',
        'before_id': 'before_id',
        'filter': 'filter'
    },
    pickOutputs = {
        '-': {
            keyName: 'response.posts',
            fields: {
                'blog_name': 'blog_name',
                'id': 'id',
                'post_url': 'post_url',
                'type': 'type',
                'timestamp': 'timestamp',
                'date': 'date',
                'reblog_key': 'reblog_key',
                'tags': 'tags'
            }
        }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickStringInputs(step, pickInputs),
            oauth = dexter.provider('tumblr').credentials(),
            uriLink = 'blog/' + inputs.base_hostname + '/posts/draft';

        if (!inputs.base_hostname)
            return this.fail('A [base_hostname] need for this module.');

        inputs.api_key = oauth.consumer_key;
        //send API request
        request.put({
            url: uriLink,
            qs: _.omit(inputs, 'base-hostname'),
            oauth: oauth,
            json: true
        }, function (error, response, body) {
            if (error)
                this.fail(error);

            else if (_.parseInt(response.statusCode) !== 200)
                this.fail(body);

            else
                this.complete(util.pickResult(body, pickOutputs));
        }.bind(this));
    }
};
