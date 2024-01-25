import SpaceOrientation from "./SpaceOrientation";

export default class Side {

    constructor(element, side, cursorX, cursorY, x1, y1, x2, y2) {
        this.element = element;
        this.side = side;

        let r1 = SpaceOrientation.getPerpendicularCondition(cursorX, cursorY, x1, y1, x2, y2);
        let r2 = SpaceOrientation.getPerpendicularCondition(cursorX, cursorY, x2, y2, x1, y1);

        if (r1 <= 0 && r2 <= 0) {
            this.perpendicular = 1;
            this.distance = SpaceOrientation.getDistanceToNearestPoint(cursorX, cursorY, x1, y1, x2, y2);
        } else if (r1 >= 0 && r2 >= 0) {
            this.perpendicular = 2;
            this.distance = SpaceOrientation.getDistanceToNearestPoint(cursorX, cursorY, x1, y1, x2, y2);
        } else {
            this.perpendicular = 0;
            this.distance = SpaceOrientation.getDistanceToSide(cursorX, cursorY, x1, y1, x2, y2);
        }
    }

}
