import Side from "./Side";

/**
 * v 0.0.1
 */
export default class SpaceOrientation {

    static LEFT = 1;
    static TOP = 2;
    static BOTTOM = 3;
    static RIGHT = 4;

    static getElementWithMinDistance(elements, cursorX, cursorY) {

        let len = elements.length;
        let minDistance = Number.MAX_SAFE_INTEGER;
        let nearestSide = null;

        for (let i = 0; i < len; i++) {
            let element = elements[i];
            let rect = element.getBoundingClientRect();

            let left = new Side(element, 1, cursorX, cursorY, rect.left, rect.top, rect.left, rect.bottom);
            let top = new Side(element, 2, cursorX, cursorY, rect.left, rect.top, rect.right, rect.top);
            let bottom = new Side(element, 3, cursorX, cursorY, rect.left, rect.bottom, rect.right, rect.bottom);
            let right = new Side(element, 4, cursorX, cursorY, rect.right, rect.top, rect.right, rect.bottom);

            if (top.perpendicular !== 0 && top.distance === left.distance) {
                let angle = SpaceOrientation.getAngle(cursorX, cursorY, rect.left, rect.top, rect.right, rect.top);
                if (angle <= 135) {
                    if (minDistance > top.distance) {
                        nearestSide = top;
                        minDistance = top.distance;
                    }
                } else {
                    if (minDistance > left.distance) {
                        nearestSide = left;
                        minDistance = left.distance;
                    }
                }

            } else if (top.perpendicular !== 0 && top.distance === right.distance) {
                let angle = SpaceOrientation.getAngle(cursorX, cursorY, rect.right, rect.top, rect.left, rect.top);

                if (angle <= 135) {
                    if (minDistance > top.distance) {
                        nearestSide = top;
                        minDistance = top.distance;
                    }
                } else {
                    if (minDistance > right.distance) {
                        nearestSide = right;
                        minDistance = right.distance;
                    }
                }

            } else if (top.perpendicular === 0) {
                if (minDistance > top.distance) {
                    nearestSide = top;
                    minDistance = top.distance;
                }
            }


            if (bottom.perpendicular !== 0 && left.distance === bottom.distance) {
                let angle = SpaceOrientation.getAngle(cursorX, cursorY, rect.left, rect.bottom, rect.left, rect.top);
                if (angle >= 135) {
                    if (minDistance > bottom.distance) {
                        nearestSide = bottom;
                        minDistance = bottom.distance;
                    }
                } else {
                    if (minDistance > left.distance) {
                        nearestSide = left;
                        minDistance = left.distance;
                    }
                }
            } else if (bottom.perpendicular !== 0 && bottom.distance === right.distance) {
                let angle = SpaceOrientation.getAngle(cursorX, cursorY, rect.right, rect.bottom, rect.right, rect.top);
                if (angle >= 135) {
                    if (minDistance > bottom.distance) {
                        nearestSide = bottom;
                        minDistance = bottom.distance;
                    }
                } else {
                    if (minDistance > right.distance) {
                        nearestSide = right;
                        minDistance = right.distance;
                    }
                }
            } else if (bottom.perpendicular === 0) {
                if (minDistance > bottom.distance) {
                    nearestSide = bottom;
                    minDistance = bottom.distance;
                }
            }

            if (right.perpendicular === 0) {
                if (minDistance > right.distance) {
                    nearestSide = right;
                    minDistance = right.distance;
                }
            }

            if (left.perpendicular === 0) {
                if (minDistance > left.distance) {
                    nearestSide = left;
                    minDistance = left.distance;
                }
            }
        }
        return nearestSide;
    }

    static beginningOrEnd(cursor, beginning, distance) {
        let result = distance - (cursor - beginning);
        let half = distance / 2;
        if (result >= half) {
            return {
                distance: distance - result,
                beginning: true
            }
        }
        return {
            distance: result,
            beginning: false
        }
    }

    static getDistanceToSide(cursorX, cursorY, x1, y1, x2, y2) {
        let a = y2 - y1;
        let b = x1 - x2;
        let c = -x1 * (y2 - y1) + y1 * (x2 - x1);

        let t = Math.sqrt(a ** 2 + b ** 2);
        return Math.abs(a * cursorX / t + b * cursorY / t + c / t);
    }

    static getDistanceToNearestPoint(cursorX, cursorY, x1, y1, x2, y2) {
        let value = ((cursorX - x1) * (x2 - x1) + (cursorY - y1) * (y2 - y1)) / ((x2 - x1) ** 2 + (y2 - y1) ** 2)
        if (value < 0) {
            value = 0;
        } else if (value > 1) {
            value = 1;
        }
        return Math.hypot(x1 - cursorX + (x2 - x1) * value, y1 - cursorY + (y2 - y1) * value);
    }

    static isPerpendicular(cursorX, cursorY, x1, y1, x2, y2) {
        let r1 = SpaceOrientation.getPerpendicularCondition(cursorX, cursorY, x1, y1, x2, y2);
        let r2 = SpaceOrientation.getPerpendicularCondition(cursorX, cursorY, x2, y2, x1, y1);
        return (r1 <= 0 && r2 >= 0) || (r1 >= 0 && r2 <= 0);
    }

    static getDistance(cursorX, cursorY, x1, y1, x2, y2) {
        if (SpaceOrientation.isPerpendicular(cursorX, cursorY, x1, y1, x2, y2)) {
            return SpaceOrientation.getDistanceToSide(cursorX, cursorY, x1, y1, x2, y2);
        }
        return SpaceOrientation.getDistanceToNearestPoint(cursorX, cursorY, x1, y1, x2, y2);
    }

    static getPerpendicularCondition(cursorX, cursorY, x1, y1, x2, y2) {
        return (cursorX - x1) * (cursorY - y1) + (x2 - x1) * (y2 - y1);
    }

    static getAngle(cursorX, cursorY, x1, y1, x2, y2) {
        let ax = x2 - x1;
        let ay = y2 - y1;

        let bx = cursorX - x1;
        let by = cursorY - y1;

        return Math.acos((ax * bx + ay * by) / (Math.sqrt(ax ** 2 + ay ** 2) * Math.sqrt(bx ** 2 + by ** 2))) * 180 / Math.PI;
    }

}