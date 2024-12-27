sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/dnd/DragInfo",
	"sap/f/dnd/GridDropInfo",
	"sap/ui/core/library"
], function (Controller, JSONModel, DragInfo, GridDropInfo, coreLibrary) {
	"use strict";

	// Shortcuts for drag-and-drop constants
	var DropPosition = coreLibrary.dnd.DropPosition;
	var DropLayout = coreLibrary.dnd.DropLayout;

	return Controller.extend("draganddrop.controller.View1", {

		onInit: function () {
			this.initData();
			this.attachDragAndDrop();
		},

		initData: function () {
			this.getView().setModel(new JSONModel({
				grid1: [
					{ title: "Item 1 (3x3)", rows: 3, columns: 3 },
					{ title: "Item 2 (3x3)", rows: 3, columns: 3 }
				],
				grid2: [
					{ title: "Item A (3x3)", rows: 3, columns: 3 },
					{ title: "Item B (3x3)", rows: 3, columns: 3 }
				],
				grid3: [
					{ title: "Item X (3x3)", rows: 3, columns: 3 },
					{ title: "Item Y (3x3)", rows: 3, columns: 3 }
				]
			}));
		},

		attachDragAndDrop: function () {
			var aGridIds = ["grid1", "grid2", "grid3"];
			var oView = this.getView();

			aGridIds.forEach(function (sGridId) {
				var oGrid = oView.byId(sGridId);

				// Enable dragging
				oGrid.addDragDropConfig(new DragInfo({
					sourceAggregation: "items"
				}));

				// Enable dropping
				oGrid.addDragDropConfig(new GridDropInfo({
					targetAggregation: "items",
					dropPosition: DropPosition.Between,
					dropLayout: DropLayout.Horizontal,
					dropIndicatorSize: this.onDropIndicatorSize.bind(this),
					drop: this.onDrop.bind(this)
				}));
			}.bind(this));
		},

		onDropIndicatorSize: function (oDraggedControl) {
			var oBindingContext = oDraggedControl.getBindingContext(),
				oData = oBindingContext.getModel().getProperty(oBindingContext.getPath());

			return {
				rows: oData.rows,
				columns: oData.columns
			};
		},

		onDrop: function (oInfo) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),
				oDragContainer = oDragged.getParent(),
				oDropContainer = oInfo.getSource().getParent(),
				oDragModel = oDragContainer.getModel(),
				oDropModel = oDropContainer.getModel(),
				sDragPath = oDragged.getBindingContext().getPath(),
				oDraggedData = oDragModel.getProperty(sDragPath);

			// Remove dragged item from its original container
			var aDragData = oDragModel.getProperty(oDragContainer.getBinding("items").getPath());
			aDragData.splice(oDragContainer.indexOfItem(oDragged), 1);

			// Handle the case where the drop target is empty
			var aDropData = oDropModel.getProperty(oDropContainer.getBinding("items").getPath());
			if (oDropped) {
				var iDropIndex = oDropContainer.indexOfItem(oDropped);
				if (sInsertPosition === "After") {
					iDropIndex++;
				}
				aDropData.splice(iDropIndex, 0, oDraggedData);
			} else {
				// If no tile exists in the drop container, simply add the dragged tile
				aDropData.push(oDraggedData);
			}

			// Update the models to reflect the changes
			oDragModel.refresh();
			oDropModel.refresh();
		}
	});
});
