describe('Yandex translate', function() {

  // sometimes it takes time to start phantomjs
  this.timeout(4000);
  var FILENAME = 'Tests/data/samplePage.html';

  it('should correctly translate sample text', function(done) {
    page.open(FILENAME, function() {

      page.injectJs('Source/assets/js/google-analytics.js');
      page.injectJs('Source/background.js');


      done();

    });
  });
});
