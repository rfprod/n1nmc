'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('appCore', function() {

	var EC = protractor.ExpectedConditions;

	it('should automatically redirect to /app/sign-in when location hash/fragment is empty', function() {
		browser.get('');
		expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);
	});

	describe('app/sign-in view', function() {

		beforeEach(function() {
			browser.ignoreSynchronization = true;
			browser.get('#/app/sign-in');
		});

		it('should render sign-in view when user navigates to /app/sign-in', function(done) {
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);
			expect(element(by.css('h1')).getText()).toMatch(/Sign In/);
			expect(element(by.css('p[class*=lead]')).getText()).toMatch(/Provide an Email address and a Password/);

			done();
		});

		it('should redirect to /app/user/dashboard view when user navigates to /app/sign-in and provides correct user credentials', function(done) {
			element(by.css('[ui-view] #email')).sendKeys('user1@email.email');
			element(by.css('[ui-view] #password')).sendKeys('000');
			element(by.css('[ui-view] input[type="submit"]')).click();

			browser.wait(EC.textToBePresentInElement(element(by.css('h1')), 'Campaign Dashboard'), 5000);
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/user\/dashboard/);

			done();
		});

		it('should redirect to /app/user/dashboard if user explicitly tries to access /app/sign-in view while being authenticated', function(done) {
			browser.setLocation('app/sign-in');
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/user\/dashboard/);

			done();
		});

		it('should be the view where user is redirected when signing out of /user/dashboard', function(done) {
			element(by.css('button[ng-click="toggleNavbarCollapse()"]')).click();
			element(by.css('a[ng-click="logout()"]')).click();
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);

			done();
		});

		it('should redirect to /app/admin/dashboard view when user navigates to /app/sign-in and provides user credentials', function(done) {
			element(by.css('[ui-view] #email')).sendKeys('admin@admin.admin');
			element(by.css('[ui-view] #password')).sendKeys('000');
			element(by.css('[ui-view] input[type="submit"]')).click();

			browser.wait(EC.textToBePresentInElement(element(by.css('h1')), 'Campaign Dashboard'), 5000);
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/admin\/dashboard/);

			done();
		});

		it('should redirect to /app/admin/dashboard if user explicitly tries to access /app/sign-in view while being authenticated', function(done) {
			browser.setLocation('app/sign-in');
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/admin\/dashboard/);

			done();
		});    

		it('should be the view where user is redirected when signing out of /app/admin/dashboard', function(done) {
			element(by.css('button[ng-click="toggleNavbarCollapse()"]')).click();
			element(by.css('a[ng-click="logout()"]')).click();
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);

			done();
		});

	});

	describe('app/user/dashboard view', function() {

		beforeEach(function() {
			browser.ignoreSynchronization = true;
			browser.get('#/app/user/dashboard');
		});

		it('should redirect to sign in view when user navigates to /app/user/dashboard without providing proper user credentials', function(done) {
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);

			done();
		});

		it('should have a nav panel with 6 menu-items/anchors, a title, and lead text', function(done) {
			element(by.css('[ui-view] #email')).sendKeys('user1@email.email');
			element(by.css('[ui-view] #password')).sendKeys('000');
			element(by.css('[ui-view] input[type="submit"]')).click();

			browser.wait(EC.textToBePresentInElement(element(by.css('h1')), 'Campaign Dashboard'), 5000);
			expect(element(by.css('h1')).getText()).toMatch(/Campaign Dashboard/);
			expect(element(by.css('p[class*=lead]')).getText()).toMatch(/Campaign information, available for your account/);

			expect(element(by.css('div[ng-if="showNavigation()"]')).all(by.tagName('a')).count()).toEqual(6);

			done();
		});

		it('should avail a user to switch UI language', function(done) {
			element(by.css('button[ng-click="toggleNavbarCollapse()"]')).click();
			element(by.css('nav a[class*=dropdown-toggle]')).click();

			browser.wait(EC.presenceOf(element(by.css('a[ng-click="changeLanguage(\'ru\')"]'))), 5000);
			expect(element(by.css('h1')).getText()).toMatch(/Campaign Dashboard/);
			element(by.css('a[ng-click="changeLanguage(\'ru\')"]')).click();
			expect(element(by.css('h1')).getText()).not.toMatch(/Campaign Dashboard/);
			element(by.css('nav a[class*=dropdown-toggle]')).click();

			browser.wait(EC.presenceOf(element(by.css('a[ng-click="changeLanguage(\'en\')"]'))), 5000);
			element(by.css('a[ng-click="changeLanguage(\'en\')"]')).click();
			expect(element(by.css('h1')).getText()).toMatch(/Campaign Dashboard/);

			done();
		});

		it('should display only Entrants data tab', function(done) {
			expect(element.all(by.css('a[ng-click="selectMode()"]')).count()).toEqual(1);
			expect(element(by.css('a[ng-click="selectMode()"]')).getText()).toEqual('Entrants');

			expect(element.all(by.css('table[ng-if="!displayModal"]')).count()).toEqual(1);
			expect(element.all(by.css('thead input')).count()).toEqual(8);
			expect(element.all(by.css('thead select')).count()).toEqual(1);

			expect(element.all(by.css('ul[class="pagination"]')).count()).toEqual(2);
			expect(element.all(by.css('ul[class="pagination"]')).first().all(by.tagName('a')).count()).toEqual(5);
			expect(element.all(by.css('ul[class="pagination"]')).last().all(by.tagName('a')).count()).toBeGreaterThan(0);

			done();
		});

		it('should have modal not present by default', function(done) {
			expect(element(by.id('modal-dashboard')).isPresent()).toBeFalsy();

			done();
		});

		it('should show and hide modal with analytical data on a respective button click', function(done) {
			element(by.css('[ui-view] a[ng-click="toggleModal()"]')).click();
			expect(element(by.id('modal-dashboard')).isPresent()).toBeTruthy();
			expect(element(by.css('nvd3')).isDisplayed()).toBeTruthy();
			element(by.css('button[ng-click="toggleModal()"]')).click();

			browser.wait(EC.stalenessOf(element(by.id('modal-dashboard'))), 5000);
			expect(element(by.id('modal-dashboard')).isPresent()).toBeFalsy();

			done();
		});

		it('should redirect to /app/sign-in view when user signs out of /app/user/dashboard', function(done) {
			element(by.css('button[ng-click="toggleNavbarCollapse()"]')).click();
			element(by.css('a[ng-click="logout()"]')).click();
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);

			done();
		});

	});

	describe('app/admin/dashboard view', function() {

		beforeEach(function() {
			browser.ignoreSynchronization = true;
			browser.get('#/app/admin/dashboard');
		});

		it('should redirect to sign in view when user navigates to /app/admin/dashboard without providing proper user credentials', function(done) {
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);

			done();
		});

		it('should have a nav panel with 6 menu-items/anchors, a title, and lead text', function(done) {
			element(by.css('[ui-view] #email')).sendKeys('admin@admin.admin');
			element(by.css('[ui-view] #password')).sendKeys('000');
			element(by.css('[ui-view] input[type="submit"]')).click();

			browser.wait(EC.textToBePresentInElement(element(by.css('h1')), 'Campaign Dashboard'), 5000);
			expect(element(by.css('h1')).getText()).toMatch(/Campaign Dashboard/);
			expect(element(by.css('p[class*=lead]')).getText()).toMatch(/Campaign information, available for your account/);

			expect(element(by.css('div[ng-if="showNavigation()"]')).all(by.tagName('a')).count()).toEqual(6);

			done();
		});

		it('should avail a user to switch UI language', function(done) {
			element(by.css('button[ng-click="toggleNavbarCollapse()"]')).click();
			element(by.css('nav a[class*=dropdown-toggle]')).click();

			browser.wait(EC.presenceOf(element(by.css('a[ng-click="changeLanguage(\'ru\')"]'))), 5000);
			expect(element(by.css('h1')).getText()).toMatch(/Campaign Dashboard/);
			element(by.css('a[ng-click="changeLanguage(\'ru\')"]')).click();
			expect(element(by.css('h1')).getText()).not.toMatch(/Campaign Dashboard/);
			element(by.css('nav a[class*=dropdown-toggle]')).click();

			browser.wait(EC.presenceOf(element(by.css('a[ng-click="changeLanguage(\'en\')"]'))), 5000);
			element(by.css('a[ng-click="changeLanguage(\'en\')"]')).click();
			expect(element(by.css('h1')).getText()).toMatch(/Campaign Dashboard/);

			done();
		});

		it('should display Entrants and Users data tabs with respective controls', function(done) {
			expect(element.all(by.css('a[ng-click="selectMode()"]')).count()).toEqual(2);
			expect(element.all(by.css('a[ng-click="selectMode()"]')).first().getText()).toEqual('Entrants');
			expect(element.all(by.css('a[ng-click="selectMode()"]')).last().getText()).toEqual('Users');
			// Entrants mode
			expect(element.all(by.css('li[role="presentation"]')).first().getAttribute('class')).toMatch(/active/);
			expect(element.all(by.tagName('table')).count()).toEqual(2);
			expect(element.all(by.css('thead input')).count()).toEqual(8);
			expect(element.all(by.css('thead select')).count()).toEqual(1);

			expect(element.all(by.css('ul[class="pagination"]')).count()).toEqual(2);
			expect(element.all(by.css('ul[class="pagination"]')).first().all(by.tagName('a')).count()).toEqual(5);
			expect(element.all(by.css('ul[class="pagination"]')).last().all(by.tagName('a')).count()).toBeGreaterThan(0);

			expect(element.all(by.css('a[ng-click*=deleteEntrant]')).count()).toBeGreaterThan(0);
			expect(element.all(by.css('div[class*=toggle-group]')).count()).toBeGreaterThan(0);

			element.all(by.css('a[ng-click="selectMode()"]')).last().click();
			browser.wait(EC.elementToBeClickable(element.all(by.css('a[ng-click="selectMode()"]')).first()), 5000);
			// Users mode
			expect(element.all(by.css('thead input')).count()).toEqual(6);
			expect(element.all(by.css('thead select')).count()).toEqual(1);

			expect(element.all(by.css('ul[class="pagination"]')).count()).toEqual(0);

			expect(element.all(by.css('a[ng-click*=editAccount]')).count()).toBeGreaterThan(0);
			expect(element.all(by.css('a[ng-click*=resetAccountPassword]')).count()).toBeGreaterThan(0);
			expect(element.all(by.css('a[ng-click*=deleteAccount]')).count()).toBeGreaterThan(0);

			done();
		});

		it('should have modal not present by default', function(done) {
			expect(element(by.id('modal-dashboard')).isPresent()).toBeFalsy();

			done();
		});

		it('should show and hide modal with analytical data on a respective button click', function(done) {
			element(by.css('[ui-view] a[ng-click="toggleModal()"]')).click();
			expect(element(by.id('modal-dashboard')).isPresent()).toBeTruthy();
			expect(element(by.css('nvd3')).isDisplayed()).toBeTruthy();
			element(by.css('button[ng-click="toggleModal()"]')).click();

			browser.wait(EC.stalenessOf(element(by.id('modal-dashboard'))), 5000);
			expect(element(by.id('modal-dashboard')).isPresent()).toBeFalsy();

			done();
		});

		it('should redirect to /app/sign-in view when user signs out of /app/admin/dashboard', function(done) {
			element(by.css('button[ng-click="toggleNavbarCollapse()"]')).click();
			element(by.css('a[ng-click="logout()"]')).click();
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);

			done();
		});

	});

	describe('app/profile view', function() {

		beforeEach(function() {
			browser.ignoreSynchronization = true;
			browser.get('#/app/profile');
		});

		it('should redirect to sign in view when user navigates to /profile without providing proper user credentials', function(done) {
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);

			element(by.css('[ui-view] #email')).sendKeys('admin@admin.admin');
			element(by.css('[ui-view] #password')).sendKeys('000');
			element(by.css('[ui-view] input[type="submit"]')).click();

			done();
		});

		it('should have a nav panel with 6 menu-items/anchors, a title, and lead text', function(done) {
			browser.wait(EC.textToBePresentInElement(element(by.css('h1')), 'User Profile'), 5000);
			expect(element(by.css('h1')).getText()).toMatch(/User Profile/);
			expect(element(by.css('p[class*=lead]')).getText()).toMatch(/Information about your account/);

			expect(element(by.css('div[ng-if="showNavigation()"]')).all(by.tagName('a')).count()).toEqual(6);

			done();
		});

		it('should avail a user to switch UI language', function(done) {
			element(by.css('button[ng-click="toggleNavbarCollapse()"]')).click();
			element(by.css('nav a[class*=dropdown-toggle]')).click();

			browser.wait(EC.presenceOf(element(by.css('a[ng-click="changeLanguage(\'ru\')"]'))), 5000);
			expect(element(by.css('h1')).getText()).toMatch(/User Profile/);
			element(by.css('a[ng-click="changeLanguage(\'ru\')"]')).click();
			expect(element(by.css('h1')).getText()).not.toMatch(/User Profile/);
			element(by.css('nav a[class*=dropdown-toggle]')).click();

			browser.wait(EC.presenceOf(element(by.css('a[ng-click="changeLanguage(\'en\')"]'))), 5000);
			element(by.css('a[ng-click="changeLanguage(\'en\')"]')).click();
			expect(element(by.css('h1')).getText()).toMatch(/User Profile/);

			done();
		});

		it('should display a two-mode form (profile management, password reset) with some fields prefilled with user data some of which are not editable', function(done) {
			expect(element.all(by.tagName('input')).count()).toEqual(10);

			expect(element.all(by.tagName('input')).first().getAttribute('value')).toEqual('admin');
			expect(element.all(by.tagName('input')).get(1).getAttribute('value')).not.toEqual('');
			expect(element.all(by.tagName('input')).get(2).getAttribute('value')).not.toEqual('');
			expect(element.all(by.tagName('input')).get(3).getAttribute('value')).toEqual('admin');
			expect(element.all(by.tagName('input')).get(4).getAttribute('value')).toEqual('admin@admin.admin');
			expect(element.all(by.tagName('input')).get(5).getAttribute('value')).toEqual('Update');
			expect(element.all(by.tagName('input')).get(6).getAttribute('value')).toEqual('');
			expect(element.all(by.tagName('input')).get(7).getAttribute('value')).toEqual('');
			expect(element.all(by.tagName('input')).get(8).getAttribute('value')).toEqual('');
			expect(element.all(by.tagName('input')).last().getAttribute('value')).toEqual('Update');

			// profile management mode
			expect(element.all(by.tagName('input')).first().isDisplayed()).toBeTruthy();
			expect(element.all(by.tagName('input')).first().getAttribute('ng-readonly')).toEqual('true');
			expect(element.all(by.tagName('input')).get(1).getAttribute('ng-readonly')).toEqual(null);
			expect(element.all(by.tagName('input')).get(2).getAttribute('ng-readonly')).toEqual(null);
			expect(element.all(by.tagName('input')).get(3).getAttribute('ng-readonly')).toEqual('true');
			expect(element.all(by.tagName('input')).get(4).getAttribute('ng-readonly')).toEqual(null);
			expect(element.all(by.tagName('input')).get(5).isDisplayed()).toBeTruthy();
			expect(element.all(by.tagName('input')).get(5).isEnabled()).toBeFalsy();
			expect(element.all(by.tagName('input')).get(6).isDisplayed()).toBeFalsy();
			expect(element.all(by.tagName('input')).last().isEnabled()).toBeFalsy();

			expect(element.all(by.css('a[ng-click="switchMode()"]')).first().getText()).toMatch(/Reset password/);

			expect(element.all(by.css('a[ng-click="switchMode()"]')).first().isDisplayed()).toBeTruthy();
			expect(element.all(by.css('a[ng-click="switchMode()"]')).last().isDisplayed()).toBeFalsy();

			// input and reset change
			element.all(by.tagName('input')).get(1).sendKeys('zzz');
			expect(element(by.css('a[ng-click="resetChanges()"]')).isDisplayed()).toBeTruthy();
			expect(element(by.css('a[ng-click="resetChanges()"]')).getText()).toMatch(/Reset changes/);
			expect(element.all(by.tagName('input')).get(1).getAttribute('value')).toContain('zzz');
			expect(element.all(by.tagName('input')).get(5).isEnabled()).toBeTruthy();
			element(by.css('a[ng-click="resetChanges()"]')).click();
			expect(element.all(by.tagName('input')).get(1).getAttribute('value')).not.toContain('zzz');
			expect(element.all(by.tagName('input')).get(5).isEnabled()).toBeFalsy();

			// change mode
			element.all(by.css('a[ng-click="switchMode()"]')).first().click();
			browser.wait(EC.visibilityOf(element.all(by.tagName('input')).get(6)), 5000);
			
			// password reset mode
			expect(element.all(by.tagName('input')).first().isDisplayed()).toBeFalsy();
			expect(element.all(by.tagName('input')).get(5).isDisplayed()).toBeFalsy();
			expect(element.all(by.tagName('input')).get(6).isDisplayed()).toBeTruthy();
			expect(element.all(by.tagName('input')).get(6).getAttribute('ng-readonly')).toEqual(null);
			expect(element.all(by.tagName('input')).get(7).getAttribute('ng-readonly')).toEqual(null);
			expect(element.all(by.tagName('input')).get(8).getAttribute('ng-readonly')).toEqual(null);
			expect(element.all(by.tagName('input')).last().isDisplayed()).toBeTruthy();
			expect(element.all(by.tagName('input')).last().isEnabled()).toBeFalsy();

			expect(element.all(by.css('a[ng-click="switchMode()"]')).last().getText()).toMatch(/Manage profile/);

			expect(element.all(by.css('a[ng-click="switchMode()"]')).first().isDisplayed()).toBeFalsy();
			expect(element.all(by.css('a[ng-click="switchMode()"]')).last().isDisplayed()).toBeTruthy();

			// change mode
			element.all(by.css('a[ng-click="switchMode()"]')).last().click();
			browser.wait(EC.visibilityOf(element.all(by.tagName('input')).first()), 5000);

			done();
		});

		it('should update editable user data', function(done) {
			element.all(by.tagName('input')).get(1).getAttribute('value').then(function(currentName) {
				element.all(by.tagName('input')).get(1).sendKeys('0');
				element.all(by.tagName('input')).get(5).click();

				browser.wait(EC.textToBePresentInElementValue(element.all(by.tagName('input')).get(1), currentName + '0'), 5000);
				expect(element.all(by.tagName('input')).get(1).getAttribute('value')).toMatch(currentName + '0');

				done();
			});
		});

		it('should redirect to /app/sign-in view when user signs out of /app/profile', function(done) {
			element(by.css('button[ng-click="toggleNavbarCollapse()"]')).click();
			element(by.css('a[ng-click="logout()"]')).click();
			expect(browser.getLocationAbsUrl()).toMatch(/\/app\/sign-in/);

			done();
		});

	});

});
