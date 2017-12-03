'use strict';

function config($translateProvider) {

	// TODO: clarify about come suitable strategy
	//$translateProvider.useSanitizeValueStrategy('sanitize');
	/*
	* Currently there is an issue with the sanitize mode, it will double encode UTF-8 characters or special characters.
	* for now it is recommended to use 'escape' strategy in doc: https://angular-translate.github.io/docs/#/guide/19_security
	* 'escape' was introduced in 2.7.0, will be removed in 3.0
	* current versions is: angular-translate - v2.11.0 - 2016-03-20
	*/
	$translateProvider.useSanitizeValueStrategy('escape');

	$translateProvider

		.translations('ru', {

			'Nav.Header': 'APP',
			'App.Title': 'Назване приложения',
			'App.Brief': 'Краткое описание приложения',

			'Page.Title.Signin': 'Вход в систему',
			'Page.Brief.Signin': 'Введите адрес эл. почты и пароль',

			'Page.Title.Dashboard': 'Панель кампании',
			'Page.Brief.Dashboard': 'Информация о кампании, доступная для вашей учётной записи',

			'Page.Title.Profile': 'Профиль Пользователя',
			'Page.Brief.Profile': 'Информация о вашей учётной записи',

			'Modal.Title.NewAccount': 'Новая учётная запись',

			'Common.Title.Users': 'Пользователи',
			'Common.Title.Entrants': 'Участники',

			'Common.Action.Language': 'Язык',
			'Common.Action.Logout': 'Выход',
			'Common.Action.Reset': 'Сбросить',
			'Common.Action.Add': 'Добавить',
			'Common.Action.Save': 'Сохранить',
			'Common.Action.Cancel': 'Отмена',
			'Common.Action.Edit': 'Изменить',
			'Common.Action.Remove': 'Удалить',
			'Common.Action.Search': 'Поиск',
			'Common.Action.Select': 'Выбрать',
			'Common.Action.Close': 'Закрыть',
			'Common.Action.Ok': 'OK',
			'Common.Action.Update': 'Обновить',
			'Common.Action.ManageProfile': 'Управление профилем',
			'Common.Action.ResetPassword': 'Сброс пароля',
			'Common.Action.Yes': 'Да',
			'Common.Action.No': 'Нет',
			'Common.Action.ResetChanges': 'Cбросить изменения',

			'Common.Table.Header.Id': 'Ид.',
			'Common.Table.Header.Created': 'Создано',
			'Common.Table.Header.Participates': 'Участвует',
			'Common.Table.Header.FullName': 'Полное имя',
			'Common.Table.Header.FirstName': 'Имя',
			'Common.Table.Header.LastName': 'Фамилия',
			'Common.Table.Header.Email': 'Эл. почта',
			'Common.Table.Header.Phone': 'Телефон',
			'Common.Table.Header.Control': 'Контроль',
			'Common.Table.Header.Control.Amount': 'Количество',
			'Common.Table.Header.Control.VendorId': 'Ид. продавца',
			'Common.Table.Header.Control.Message': 'Сообщение',
			'Common.Table.Header.Control.Image': 'Изображение',
			'Common.Table.Header.Login': 'Имя пользвоателя',
			'Common.Table.Header.Role': 'Роль',
			'Common.Table.Header.LastLogin': 'Последний вход',

			'Common.Form.Placeholder.Login': 'Имя пользователя',
			'Common.Form.Placeholder.FirstName': 'Имя',
			'Common.Form.Placeholder.LastName': 'Фамилия',
			'Common.Form.Placeholder.Role': 'Роль',
			'Common.Form.Placeholder.Email': 'Адрес эл. почты',
			'Common.Form.Feedback.Email': 'Неправильный адрес эл. почты',
			'Common.Form.Placeholder.Password': 'Пароль',
			'Common.Form.Feedback.Password': 'Неправильный пароль',
			'Common.Form.Placeholder.NewPassword': 'Новый пароль',
			'Common.Form.Feedback.NewPassword': 'Неправильный пароль',
			'Common.Form.Placeholder.PasswordConfirmation': 'Подтверждение пароля',
			'Common.Form.Feedback.PasswordConfirmation': 'Значения нового пароля и его подтверждения не совпадают',
			'Common.Form.Feedback.RestoreValue': 'Восстановить значение',
			'Common.Form.Feedback.Empty': 'Заполнение этого поля обязательно',
			'Common.Form.Feedback.Role': 'Пожалуйста выберите роль',

			'Common.Role.User': 'Пользователь',
			'Common.Role.Admin': 'Администратор'

		})
		.translations('en', {

			'Nav.Header': 'APP',
			'App.Title': 'Application Title',
			'App.Brief': 'Brief description for the application',

			'Page.Title.Signin': 'Sign In',
			'Page.Brief.Signin': 'Provide an Email address and a Password',

			'Page.Title.Dashboard': 'Campaign Dashboard',
			'Page.Brief.Dashboard': 'Campaign information, available for your account',

			'Page.Title.Profile': 'User Profile',
			'Page.Brief.Profile': 'Information about your account',

			'Modal.Title.NewAccount': 'New Account',

			'Common.Title.Users': 'Users',
			'Common.Title.Entrants': 'Entrants',

			'Common.Action.Language': 'Language',
			'Common.Action.Logout': 'Logout',
			'Common.Action.Reset': 'Reset',
			'Common.Action.Add': 'Add',
			'Common.Action.Save': 'Save',
			'Common.Action.Cancel': 'Cancel',
			'Common.Action.Edit': 'Edit',
			'Common.Action.Remove': 'Remove',
			'Common.Action.Search': 'Search',
			'Common.Action.Select': 'Select',
			'Common.Action.Close': 'Close',
			'Common.Action.Ok': 'OK',
			'Common.Action.Update': 'Update',
			'Common.Action.ManageProfile': 'Manage profile',
			'Common.Action.ResetPassword': 'Reset password',
			'Common.Action.Yes': 'Yes',
			'Common.Action.No': 'No',
			'Common.Action.ResetChanges': 'Reset changes',

			'Common.Table.Header.Id': 'Id',
			'Common.Table.Header.Created': 'Created',
			'Common.Table.Header.Participates': 'Participates',
			'Common.Table.Header.FullName': 'Full Name',
			'Common.Table.Header.FirstName': 'First Name',
			'Common.Table.Header.LastName': 'Last Name',
			'Common.Table.Header.Email': 'Email',
			'Common.Table.Header.Phone': 'Phone',
			'Common.Table.Header.Control': 'Control',
			'Common.Table.Header.Control.Amount': 'Amount',
			'Common.Table.Header.Control.VendorId': 'Vendor Id',
			'Common.Table.Header.Control.Message': 'Message',
			'Common.Table.Header.Control.Image': 'Image',
			'Common.Table.Header.Login': 'Login',
			'Common.Table.Header.Role': 'Role',
			'Common.Table.Header.LastLogin': 'LastLogin',

			'Common.Form.Placeholder.Login': 'Login',
			'Common.Form.Placeholder.FirstName': 'First name',
			'Common.Form.Placeholder.LastName': 'Last name',
			'Common.Form.Placeholder.Role': 'Role',
			'Common.Form.Placeholder.Email': 'Email address',
			'Common.Form.Feedback.Email': 'Wrong email address',
			'Common.Form.Placeholder.Password': 'Password',
			'Common.Form.Feedback.Password': 'Wrong password',
			'Common.Form.Placeholder.NewPassword': 'New password',
			'Common.Form.Feedback.NewPassword': 'Wrong password',
			'Common.Form.Placeholder.PasswordConfirmation': 'Password confirmation',
			'Common.Form.Feedback.PasswordConfirmation': 'New password and password confirmation do not match',
			'Common.Form.Feedback.RestoreValue': 'Restore value',
			'Common.Form.Feedback.Empty': 'The field is required',
			'Common.Form.Feedback.Role': 'Please select a role',

			'Common.Role.User': 'User',
			'Common.Role.Admin': 'Administrator'

		});

	$translateProvider.preferredLanguage('en');

}

angular.module('appCore').config(['$translateProvider', config]);
