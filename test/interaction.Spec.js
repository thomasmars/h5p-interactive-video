describe('Interaction', function () {
  var $ = H5P.jQuery;

  beforeEach(function () {
    this.params = {
      action: {
        library: 'test',
        params: {
        }
      },
      duration: {

      }
    };

    this.player = {
      contentId: 1,
      l10n: {
      }
    };

    this.instance = jasmine.createSpyObj('instance', ['on']);
    this.newRunnable = spyOn(H5P, 'newRunnable').and.returnValue(this.instance);
  });

  afterEach(function () {
    this.params = undefined;
    this.player = undefined;
    this.instance = undefined;
    this.newRunnable = undefined;
  });

  describe('Constructor', function () {
    it('should create a new runnable with the correct args', function () {
      new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(this.newRunnable.calls.mostRecent().args[0]).toEqual(this.params.action);
      expect(this.newRunnable).toHaveBeenCalled();
    });

    it('should inherit from the Event Dispatcher', function () {
      var inheritance = spyOn(H5P.EventDispatcher, 'call');
      new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(inheritance).toHaveBeenCalled();
    });

    it('should not call newRunnable when run with H5P.Nil as library', function () {
      this.params.action.library = 'H5P.Nil';
      new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(this.newRunnable).not.toHaveBeenCalled();
    });

    it('should register xAPI listener', function () {
      new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(this.instance.on).toHaveBeenCalled();
    });

    it('should register a specific "chosen" listener for H5P.GoToQuestion', function () {
      this.params.action.library = 'H5P.GoToQuestion';
      new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(this.instance.on.calls.mostRecent().args[0]).toEqual('chosen');
    });
  });

  it('should return current state from interaction instance', function () {
    this.instance = jasmine.createSpyObj('instance', ['getCurrentState']);
    this.instance.getCurrentState.and.returnValue('test');
    H5P.newRunnable.and.returnValue(this.instance);
    var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
    var currentState = ivi.getCurrentState();
    expect(this.instance.getCurrentState).toHaveBeenCalled();
    expect(currentState).toEqual('test');
  });

  describe('Button view', function () {
    it('should return true if interaction is a button', function () {
      this.params.displayType = 'button';
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(ivi.isButton()).toBeTruthy();
    });

    it('should return false if interaction is a poster', function () {
      this.params.displayType = 'poster';
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(ivi.isButton()).toBeFalsy();
    });

    it('should always return true for H5P.Nil library', function () {
      this.params.action.library = 'H5P.Nil';
      this.params.displayType = 'poster';
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(ivi.isButton()).toBeTruthy();
    });

    it('should always return true if in mobile view', function () {
      this.player.isMobileView = true;
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(ivi.isButton()).toBeTruthy();
    });
  });

  describe('Summary', function () {
    it('should return true for summary interactions', function () {
      this.params.mainSummary = true;
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(ivi.isMainSummary()).toBeTruthy();
    });

    it('should return false otherwise', function () {
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(ivi.isMainSummary()).toBeFalsy();
    })
  });

  describe('Create Dot', function () {
    beforeEach(function () {
      this.$container = $('<div></div>');

      // Each second is one percentage
      this.params.duration.from = 10;
      this.player.oneSecondInPercentage = 1;
    });

    afterEach(function () {
      this.$container = undefined;
    });

    it('should skip H5P.Nil library', function () {
      this.params.action.library = 'H5P.Nil';
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      expect(ivi.addDot(this.$container)).toBeUndefined();
    });

    it('should append dot element to container', function () {
      expect(this.$container.children().length).toBe(0);
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      ivi.addDot(this.$container);
      expect(this.$container.children().length).toBe(1);
    });

    it('should get the "h5p-seekbar-interaction" and instance parameter classes', function () {
      this.params.className = 'interaction-class-name';
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      ivi.addDot(this.$container);
      var $el = this.$container.children('.h5p-seekbar-interaction');
      expect($el.hasClass('h5p-seekbar-interaction')).toBeTruthy();
      expect($el.hasClass('interaction-class-name')).toBeTruthy();
    });

    it('should get the interaction content name as title if it exists', function () {
      this.params.action.params.contentName = 'test-content-name';
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      ivi.addDot(this.$container);
      var $el = this.$container.children('.h5p-seekbar-interaction');
      expect($el.attr('title')).toEqual('test-content-name');
    });

    it('should get the standard interaction text if instance content name does not exits', function () {
      this.player.l10n.interaction = 'test-standard-interaction-name';
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      ivi.addDot(this.$container);
      var $el = this.$container.children('.h5p-seekbar-interaction');
      expect($el.attr('title')).toEqual('test-standard-interaction-name');
    });

    it('should be positioned 10% to the left of the container', function () {
      var ivi = new H5P.InteractiveVideoInteraction(this.params, this.player, undefined);
      ivi.addDot(this.$container);
      var $el = this.$container.children('.h5p-seekbar-interaction');
      expect($el.css('left')).toEqual('10%');
    });
  });
  
  describe('Toggle interaction', function () {
    
  });
});
