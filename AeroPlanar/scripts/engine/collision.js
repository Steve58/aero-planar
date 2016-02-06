// collision
// Collision detection features

"use strict";

window.e58 = window.e58 || {};

e58.collision = {};

(function () {
    e58.collision.areBlocksInContact = function (blockA, blockB) {
        var i, j;

        if (blockA.frame.origin.getDistance(blockB.frame.origin) > blockA.rMax + blockB.rMax) {
            return false;
        }

        calculateCachedValues([blockA, blockB]);

        for (i = blockA.polygons.length - 1; i >= 0; --i) {
            for (j = blockB.polygons.length - 1; j >= 0; --j) {
                if (arePolygonsInContact(blockA.polygons[i], blockB.polygons[j])
                        || arePolygonsInContact(blockB.polygons[j], blockA.polygons[i])) {
                    clearCachedValues([blockA, blockB]);
                    return true;
                }
            }
        }

        clearCachedValues([blockA, blockB]);
        return false;
    };

    function calculateCachedValues(blocks) {
        blocks.forEach(function (block) {
            block.polygons.forEach(function (polygon) {
                polygon.cachedUniversePoints = polygon.getUniversePoints();
                polygon.cachedPolygonFrame = getPolygonFrame(polygon.cachedUniversePoints);
                polygon.cachedPointsInPolygonFrame = getPolygonPointsInPolygonFrame(polygon);
            });
        });
    }

    function clearCachedValues(blocks) {
        blocks.forEach(function (block) {
            block.polygons.forEach(function (polygon) {
                polygon.cachedUniversePoints = null;
                polygon.cachedPolygonFrame = null;
                polygon.cachedPointsInPolygonFrame = null;
            });
        });
    }

    // Gets a frame with all polygonPoints in x-y polygon (z = 0)
    function getPolygonFrame(polygonPoints) {
        // Assume first three polygon points are not in a line
        // Point 0 is the origin
        var polygonFrame = e58.frame.getNew(polygonPoints[0], 0, 0, 0);

        var inFrame = function (point) {
            return point.getPointInFrame(polygonFrame, /* sign: */ 1);
        };

        // Rotate for x axis along line from point 0 to point 1 in two steps
        polygonFrame.rotateInOwnFrameZ(
                -s58.radToDeg(s58.radPiToPi(Math.atan2(inFrame(polygonPoints[1]).y, inFrame(polygonPoints[1]).x))));


        polygonFrame.rotateInOwnFrameY(
                -s58.radToDeg(s58.radPiToPi(Math.atan2(inFrame(polygonPoints[1]).z, inFrame(polygonPoints[1]).x))));

        // Rotate for point 2 in x-y frame polygon
        polygonFrame.rotateInOwnFrameX(
                -s58.radToDeg(s58.radPiToPi(Math.atan2(inFrame(polygonPoints[2]).z, inFrame(polygonPoints[2]).y))));

        return polygonFrame;
    }

    function getPolygonPointsInPolygonFrame(polygon) {
        var pointsInFrame = [];
        polygon.cachedUniversePoints.forEach(function (point, i) {
            pointsInFrame.push(
                point.getPointInFrame(polygon.cachedPolygonFrame, /* sign: */ -1));
        });
        return pointsInFrame;
    }

    function arePolygonsInContact(linesPolygon, polygonPolygon) {
        var i;
        var nLines = linesPolygon.cachedUniversePoints.length;
        for (i = nLines -1; i >= 0; i--) {
            if (doesLineHitPolygon(
                    [linesPolygon.cachedUniversePoints[i], linesPolygon.cachedUniversePoints[(i + 1) % nLines]],
                    polygonPolygon)) {
                return true;
            }
        }
        return false;
    }

    function doesLineHitPolygon(linePoints, polygon) {
        // TODO: handle "line in plane" case
        var intersectPointInPolygonFrame = getLinePlaneIntersect(linePoints, polygon);

        return intersectPointInPolygonFrame ?
            isPointIn2dLocus(intersectPointInPolygonFrame, polygon.cachedPointsInPolygonFrame):
            false;
    }

    // Get the  intersect of the line and the plane of the specified Polygon, or null
    function getLinePlaneIntersect(linePoints, polygon) {
        var linePointsInFrame = [
            linePoints[0].getPointInFrame(polygon.cachedPolygonFrame, /* sign: */ -1),
            linePoints[1].getPointInFrame(polygon.cachedPolygonFrame, /* sign: */ -1)];

        if (linePointsInFrame[0].z * linePointsInFrame[1].z >= 0
                || linePointsInFrame[1].z - linePointsInFrame[0].z == 0) {
            return null;
        }

        var intersectRatio = -linePointsInFrame[0].z / (linePointsInFrame[1].z - linePointsInFrame[0].z);

        return e58.point.getNewXYZ(
            linePointsInFrame[0].x + intersectRatio * (linePointsInFrame[1].x - linePointsInFrame[0].x),
            linePointsInFrame[0].y + intersectRatio * (linePointsInFrame[1].y - linePointsInFrame[0].y),
            linePointsInFrame[0].z + intersectRatio * (linePointsInFrame[1].z - linePointsInFrame[0].z));
    }

    // Is the point within the specified locus?
    // Assumed point and locusPoints all in x-y polygon.
    function isPointIn2dLocus(point, locusPoints) {
        // assume no concave sides to locus (polygon)
        var i, bearingDifferenceRad;

        for (i = locusPoints.length - 1; i >= 0; --i) {
            locusPoints[i].bearingRad = (Math.atan2(locusPoints[i].x - point.x, locusPoints[i].y - point.y) + s58.THREEPI) % s58.TWOPI;
        }

        var bearingDifferenceRadSum = 0;
        for (i = locusPoints.length - 1; i >= 0; --i) {
            bearingDifferenceRad = Math.abs(locusPoints[i].bearingRad - locusPoints[(i + 1) % locusPoints.length].bearingRad);
            bearingDifferenceRadSum += bearingDifferenceRad <= s58.PI ?
                bearingDifferenceRad:
                s58.TWOPI - bearingDifferenceRad;
        }

        // console.log("isPointIn2dLocus " + " x: " + point.x + " y: " + point.y + " bearingDifferenceRadSum: " + bearingDifferenceRadSum);
        return bearingDifferenceRadSum > s58.TWOPI - 0.01 && bearingDifferenceRadSum < s58.TWOPI + 0.01;
    }
})();
