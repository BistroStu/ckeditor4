( function() {
	'use strict';

	var doc = CKEDITOR.document,
		dialogStatusStyle =
			'<style>' +
				'#dialog-status { border: 2px solid orange; margin-right: 3em; }' +

				'#dialog-status #missing-dialog-info{ text-align: center; font-size: 2em; }' +

				'#dialog-status.active #missing-dialog-info { display: none; }' +
				'#dialog-status.active #dialog-summary { display: block; }' +

				'#dialog-status #dialog-summary { display: none; }' +
			'</style>',

		dialogStatusHtml =
			'<div id="dialog-status">' +
			'<div id="dialog-summary">' +
					'<div>Dialog name: <strong id="dialog-name"></strong> in <strong id="editor-name"></strong> editor.</div>' +
					'<div>Dialog is in <strong id="dialog-type"></strong> mode.</div>' +
					'<div>Currently editing: <span id="dialog-model"></span></div>' +
					'</div>' +
					'<div id="missing-dialog-info">' +
					'Once you open any dialog this box will contain helper information.' +
					'</div>' +
			' </div>';

	window.dialogTools = {
		/**
		 * Initialize manual test for dialog model editing mode introduced with #2423.
		 *
		 * ```javascript
		 *
		 * // With a single editor instance.
		 * dialogTools.initDialogEditingModeTest( editor );
		 *
		 * // With multiple editor instances.
		 * dialogTools.initDialogEditingModeTest( CKEDITOR.instances );
		 * ```
		 * @param {Object} editors
		 */
		initDialogEditingModeTest: function( editors ) {
			if ( !doc.getById( 'dialog-status' ) ) {
				var body = doc.getBody();
				body.append( CKEDITOR.dom.element.createFromHtml( dialogStatusStyle ), true );
				body.append( CKEDITOR.dom.element.createFromHtml( dialogStatusHtml ), true );
			}

			if ( editors instanceof CKEDITOR.editor ) {
				editors.on( 'dialogShow', dialogShowListener );
			} else {
				for ( var editorName in editors ) {
					editors[ editorName ].on( 'dialogShow', dialogShowListener );
				}
			}
		}
	};

	function dialogShowListener( evt ) {
		var dialog = evt.data,
			editor = evt.editor,
			isEditMode = dialog.isEditing( editor );

		doc.getById( 'dialog-status' ).addClass( 'active' );
		doc.getById( 'dialog-name' ).setText( dialog.getName() );
		doc.getById( 'dialog-type' ).setText( isEditMode ? 'editing' : 'creation' );
		doc.getById( 'dialog-model' ).setText( stringifyModel( editor, dialog.getModel( editor ) ) );
		doc.getById( 'editor-name' ).setText( editor.name );

		dialog.once( 'hide', function() {
			doc.getById( 'dialog-status' ).removeClass( 'active' );
		} );
	}

	function stringifyModel( editor, val ) {
		if ( !val ) {
			return String( val );
		}

		if ( val instanceof CKEDITOR.dom.element ) {
			// Some elements may be faked, output real element
			// for simplification.
			if ( val.data( 'cke-real-element-type' ) ) {
				val = editor.restoreRealElement( val );
			}

			return val.getOuterHtml();
		}

		if ( val instanceof CKEDITOR.dom.document ) {
			return 'document';
		}

		if ( CKEDITOR.plugins.widget && val instanceof CKEDITOR.plugins.widget ) {
			return 'Widget (' + val.name + ')';
		}

		if ( CKEDITOR.tools.isArray( val ) ) {
			var html = '';
			for ( var i = 0; i < val.length; i++ ) {
				html += stringifyModel( editor, val[ i ] );
			}
			return html;
		}

		return String( val );
	}

} )();
