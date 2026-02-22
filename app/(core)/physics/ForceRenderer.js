/**
 * ForceRenderer - Centralized force visualization utilities
 * Provides consistent, beautiful force vector rendering across all simulations
 */

export class ForceRenderer {
  constructor(options = {}) {
    this.config = {
      scale: options.scale || 5, // pixels per Newton
      arrowSize: options.arrowSize || 10,
      strokeWeight: options.strokeWeight || 3,
      showLabels: options.showLabels !== false,
      showMagnitude: options.showMagnitude !== false,
      labelSize: options.labelSize || 12,
      labelOffset: options.labelOffset || 15,
      minMagnitude: options.minMagnitude || 0.01, // Don't draw tiny forces
      ...options,
    };

    // Force type colors
    this.colors = {
      weight: "#ef4444", // red
      normal: "#10b981", // green
      friction: "#f59e0b", // orange
      applied: "#a855f7", // purple
      tension: "#06b6d4", // cyan
      spring: "#ec4899", // pink
      drag: "#6366f1", // indigo
      net: "#fbbf24", // yellow
      component: "#fca5a5", // light red (dashed)
      ...options.colors,
    };
  }

  /**
   * Draw a force vector
   */
  drawVector(
    p,
    startX,
    startY,
    forceX,
    forceY,
    color,
    label = null,
    options = {}
  ) {
    const magnitude = Math.sqrt(forceX * forceX + forceY * forceY);

    if (magnitude < this.config.minMagnitude) return;

    const scaledX = forceX * this.config.scale;
    const scaledY = forceY * this.config.scale;
    const endX = startX + scaledX;
    const endY = startY + scaledY;

    p.push();

    // Apply dashed line if specified
    if (options.dashed) {
      p.drawingContext.setLineDash([5, 5]);
    }

    // Draw line
    p.stroke(color);
    p.strokeWeight(options.strokeWeight || this.config.strokeWeight);
    p.line(startX, startY, endX, endY);

    // Draw arrowhead
    if (!options.noArrow) {
      this.drawArrowhead(p, startX, startY, endX, endY, color, options);
    }

    // Reset dash
    if (options.dashed) {
      p.drawingContext.setLineDash([]);
    }

    // Draw label
    if (this.config.showLabels && label) {
      this.drawLabel(p, endX, endY, label, magnitude, color, options);
    }

    p.pop();
  }

  /**
   * Draw arrowhead at the end of a vector
   */
  drawArrowhead(p, startX, startY, endX, endY, color, options = {}) {
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowSize = options.arrowSize || this.config.arrowSize;

    p.push();
    p.translate(endX, endY);
    p.rotate(angle);
    p.fill(color);
    p.noStroke();
    p.triangle(0, 0, -arrowSize, -arrowSize / 2, -arrowSize, arrowSize / 2);
    p.pop();
  }

  /**
   * Draw force label with magnitude
   */
  drawLabel(p, x, y, text, magnitude, color, options = {}) {
    const offset = options.labelOffset || this.config.labelOffset;
    const showMag =
      options.showMagnitude !== false && this.config.showMagnitude;

    let labelText = text;
    if (showMag && magnitude !== undefined) {
      labelText = `${text} (${magnitude.toFixed(1)}N)`;
    }

    p.push();
    p.noStroke();

    // Background for readability
    p.fill(0, 0, 0, 150);
    const textW = p.textWidth(labelText) + 8;
    const textH = this.config.labelSize + 4;
    p.rect(x + offset - 4, y - textH / 2 - 2, textW, textH, 3);

    // Text
    p.fill(color);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(this.config.labelSize);
    p.text(labelText, x + offset, y);
    p.pop();
  }

  /**
   * Draw weight vector (always downward)
   */
  drawWeight(p, x, y, mass, gravity, options = {}) {
    const force = mass * gravity;
    this.drawVector(
      p,
      x,
      y,
      0,
      force,
      this.colors.weight,
      options.label || "Weight",
      options
    );
  }

  /**
   * Draw normal force (perpendicular to surface)
   */
  drawNormal(p, x, y, magnitude, angleRad, options = {}) {
    const normalAngle = angleRad + Math.PI / 2;
    const fx = magnitude * Math.cos(normalAngle);
    const fy = -magnitude * Math.sin(normalAngle);

    this.drawVector(
      p,
      x,
      y,
      fx,
      fy,
      this.colors.normal,
      options.label || "Normal",
      options
    );
  }

  /**
   * Draw friction force (along surface, opposes motion)
   */
  drawFriction(p, x, y, magnitude, angleRad, options = {}) {
    const fx = magnitude * Math.cos(angleRad);
    const fy = -magnitude * Math.sin(angleRad);

    this.drawVector(
      p,
      x,
      y,
      fx,
      fy,
      this.colors.friction,
      options.label || "Friction",
      options
    );
  }

  /**
   * Draw applied force at custom angle
   */
  drawApplied(p, x, y, magnitude, angleRad, options = {}) {
    const fx = magnitude * Math.cos(angleRad);
    const fy = -magnitude * Math.sin(angleRad);

    this.drawVector(
      p,
      x,
      y,
      fx,
      fy,
      this.colors.applied,
      options.label || "Applied",
      options
    );
  }

  /**
   * Draw component vectors (dashed by default)
   */
  drawComponents(p, x, y, forceX, forceY, options = {}) {
    const componentOptions = {
      dashed: true,
      strokeWeight: 2,
      ...options,
    };

    // X component
    if (Math.abs(forceX) > this.config.minMagnitude) {
      this.drawVector(
        p,
        x,
        y,
        forceX,
        0,
        this.colors.component,
        options.xLabel || "Fx",
        componentOptions
      );
    }

    // Y component
    if (Math.abs(forceY) > this.config.minMagnitude) {
      this.drawVector(
        p,
        x,
        y,
        0,
        forceY,
        this.colors.component,
        options.yLabel || "Fy",
        componentOptions
      );
    }
  }

  /**
   * Draw inclined plane force diagram
   */
  drawInclinedPlaneForces(p, x, y, forces, angleRad, options = {}) {
    const showComponents = options.showComponents !== false;

    // Weight (always vertical)
    this.drawWeight(p, x, y, forces.weight.magnitude / 9.81, 9.81, {
      label: "mg",
      ...options.weightOptions,
    });

    // Normal force
    this.drawNormal(p, x, y, forces.normal, angleRad, options.normalOptions);

    // Friction force
    if (Math.abs(forces.friction) > this.config.minMagnitude) {
      this.drawFriction(
        p,
        x,
        y,
        forces.friction,
        angleRad,
        options.frictionOptions
      );
    }

    // Applied force
    if (forces.applied.magnitude > this.config.minMagnitude) {
      const appliedAngleRad =
        Math.atan2(forces.applied.perpendicular, forces.applied.parallel) +
        angleRad;

      this.drawApplied(
        p,
        x,
        y,
        forces.applied.magnitude,
        appliedAngleRad,
        options.appliedOptions
      );
    }

    // Component vectors
    if (showComponents) {
      p.push();
      p.drawingContext.setLineDash([5, 5]);

      // Weight parallel
      const wpX =
        -forces.weight.parallel * this.config.scale * Math.cos(angleRad);
      const wpY =
        forces.weight.parallel * this.config.scale * Math.sin(angleRad);
      this.drawVector(p, x, y, wpX, wpY, this.colors.component, "mg‖", {
        dashed: true,
        strokeWeight: 2,
        showMagnitude: false,
      });

      // Weight perpendicular
      const perpAngle = angleRad + Math.PI / 2;
      const wperpX =
        forces.weight.perpendicular * this.config.scale * Math.cos(perpAngle);
      const wperpY =
        -forces.weight.perpendicular * this.config.scale * Math.sin(perpAngle);
      this.drawVector(p, x, y, wperpX, wperpY, this.colors.component, "mg⊥", {
        dashed: true,
        strokeWeight: 2,
        showMagnitude: false,
      });

      p.drawingContext.setLineDash([]);
      p.pop();
    }
  }

  /**
   * Draw net force vector
   */
  drawNetForce(p, x, y, netX, netY, options = {}) {
    this.drawVector(
      p,
      x,
      y,
      netX,
      netY,
      this.colors.net,
      options.label || "Fnet",
      { strokeWeight: 4, ...options }
    );
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Update colors
   */
  updateColors(newColors) {
    this.colors = { ...this.colors, ...newColors };
  }
}

export default ForceRenderer;
