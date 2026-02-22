/**
 * DragController - Centralized drag interaction management
 * Handles mouse/touch dragging for physics bodies
 */

import { toMeters, screenYToPhysicsY } from "../constants/Utils";

export class DragController {
  constructor(options = {}) {
    this.state = {
      active: false,
      targetBody: null,
      offset: { x: 0, y: 0 },
      initialPosition: null,
    };

    this.config = {
      snapBack: options.snapBack || false,
      smoothing: options.smoothing || 0, // 0 = no smoothing, 0.5 = moderate
      ...options,
    };
  }

  /**
   * Check if mouse press hits any body
   */
  handlePress(p, bodies) {
    if (!Array.isArray(bodies)) {
      bodies = [bodies];
    }

    for (const body of bodies) {
      if (!body) continue;

      let isHit = false;

      if (body.checkHover) {
        isHit = body.checkHover(p, body.toScreenPosition());
      }

      if (isHit) {
        this.startDrag(body, p.mouseX, p.mouseY);
        return true;
      }
    }

    return false;
  }

  /**
   * Start dragging a body
   */
  startDrag(body, mouseX, mouseY) {
    this.state.active = true;
    this.state.targetBody = body;

    // Store initial position for snap back
    if (this.config.snapBack) {
      this.state.initialPosition = body.state.position?.copy() || {
        ...body.planeState,
      };
    }

    // Calculate offset from mouse to body center
    const screenPos = body.toScreenPosition?.() || { x: mouseX, y: mouseY };
    this.state.offset = {
      x: screenPos.x - mouseX,
      y: screenPos.y - mouseY,
    };

    // Zero out velocity when starting drag
    if (body.state.velocity) {
      body.state.velocity.set(0, 0);
    }
    if (body.planeState?.velAlongPlane !== undefined) {
      body.planeState.velAlongPlane = 0;
    }
  }

  /**
   * Update dragged body position
   */
  handleDrag(p, customUpdate = null) {
    if (!this.state.active || !this.state.targetBody) return;

    const body = this.state.targetBody;

    // 1. Calculate target position in PIXELS
    const targetXPixel = p.mouseX + this.state.offset.x;
    const targetYPixel = p.mouseY + this.state.offset.y;

    if (customUpdate) {
      customUpdate(body, p.mouseX, p.mouseY);
    } else {
      if (body.state.position) {
        // 2. Convert to METERS before applying to physics
        const targetXMeters = toMeters(targetXPixel);
        const targetYMeters = screenYToPhysicsY(targetYPixel);

        if (this.config.smoothing > 0) {
          body.state.position.x +=
            (targetXMeters - body.state.position.x) * this.config.smoothing;
          body.state.position.y +=
            (targetYMeters - body.state.position.y) * this.config.smoothing;
        } else {
          body.state.position.x = targetXMeters;
          body.state.position.y = targetYMeters;
        }
      }
    }
  }

  /**
   * Release the dragged body
   */
  handleRelease(onRelease = null) {
    if (!this.state.active) return;

    const body = this.state.targetBody;

    if (this.config.snapBack && this.state.initialPosition) {
      // Snap back to initial position
      if (body.state.position) {
        body.state.position.set(
          this.state.initialPosition.x,
          this.state.initialPosition.y
        );
      } else if (body.planeState) {
        Object.assign(body.planeState, this.state.initialPosition);
      }
    }

    // Custom release callback
    if (onRelease) {
      onRelease(body);
    }

    // Reset state
    this.state.active = false;
    this.state.targetBody = null;
    this.state.offset = { x: 0, y: 0 };
    this.state.initialPosition = null;
  }

  /**
   * Check if currently dragging
   */
  isDragging() {
    return this.state.active;
  }

  /**
   * Get the currently dragged body
   */
  getDraggedBody() {
    return this.state.targetBody;
  }

  /**
   * Cancel drag without triggering release actions
   */
  cancel() {
    this.state.active = false;
    this.state.targetBody = null;
    this.state.offset = { x: 0, y: 0 };
    this.state.initialPosition = null;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * InclinedPlaneDragController - Specialized drag controller for inclined planes
 */
export class InclinedPlaneDragController extends DragController {
  constructor(planeRef, angleGetter, options = {}) {
    super(options);
    this.planeRef = planeRef;
    this.angleGetter = angleGetter; // Function that returns current angle in radians
  }

  /**
   * Handle press for inclined plane body
   */
  handlePress(p, body) {
    const plane = this.planeRef.current;
    const angleRad = this.angleGetter();

    if (body.checkHoverOnPlane) {
      const isHit = body.checkHoverOnPlane(
        p,
        { x: plane.startX, y: plane.startY },
        angleRad
      );

      if (isHit) {
        this.startDrag(body, p.mouseX, p.mouseY);
        return true;
      }
    }

    return false;
  }

  /**
   * Handle drag for inclined plane body
   */
  handleDrag(p) {
    if (!this.state.active || !this.state.targetBody) return;

    const body = this.state.targetBody;
    const plane = this.planeRef.current;
    const angleRad = this.angleGetter();

    if (body.setPositionFromScreen) {
      body.setPositionFromScreen(
        { x: plane.startX, y: plane.startY },
        angleRad,
        p.mouseX,
        p.mouseY
      );
    }
  }
}

export default DragController;
