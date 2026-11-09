import React, { useRef, useState, useEffect, useCallback } from 'react';
import './LanyardIdBadge.css';

/**
 * LanyardIdBadge
 * Ultra-realistic, Extra-Large 3D Physics ID Badge with custom ELIMENTS-branded lanyard.
 * - Bold, prominent showcase size (360px x 466px card).
 * - Thick, high-detail twin ELIMENTS ribbons (Left maroon + Right cream/bone).
 * - Scaled-up molded black quick-release buckle, circular ELIMENTS seal tab, and chrome lobster clasp.
 * - Clasp hook tip passes directly through the card's punch hole at (jointX, jointY) - 100% aligned, never detaches.
 * - Pure maroon ID card, zero white background, 3D flip on click, smooth drag with momentum and spring physics.
 */
export default function LanyardIdBadge({ onToast }) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const assemblyRef = useRef(null);
  const requestRef = useRef(null);

  // Flip state (false = Front / BatStateU ID, true = Back / Scrapbook notes)
  const [isFlipped, setIsFlipped] = useState(false);
  const isFlippedRef = useRef(false);
  isFlippedRef.current = isFlipped;

  // Drag & pointer tracking
  const isDraggingRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0, time: 0 });
  const grabOffsetRef = useRef({ x: 0, y: 0 });
  const mouseHoverRef = useRef({ x: 0, y: 0, isHovering: false });

  // Stage geometry (Extra Large Scale)
  const STAGE_W = 480;
  const ANCHOR_X = STAGE_W / 2; // 240px (centered)
  const ANCHOR_Y = 0;           // sits directly on top divider line
  const REST_LENGTH = 210;      // distance from top line down to punch hole (px)

  // Physics simulation state
  const physicsRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rotZ: 0,
    vRotZ: 0,
    rotX: 0,
    vRotX: 0,
    rotY: 0,
    vRotY: 0,
    prevDragX: 0,
    prevDragY: 0
  });

  // Dynamic SVG strap paths
  const [strapPaths, setStrapPaths] = useState({
    leftD: `M ${ANCHOR_X - 24} 0 L ${ANCHOR_X - 9} ${REST_LENGTH - 64}`,
    rightD: `M ${ANCHOR_X + 24} 0 L ${ANCHOR_X + 9} ${REST_LENGTH - 64}`
  });

  // Toggle flip between Front and Back
  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const next = !prev;
      physicsRef.current.vRotY += next ? 32 : -32;
      physicsRef.current.vy -= 10;
      physicsRef.current.vRotX += (Math.random() - 0.5) * 10;
      onToast?.(next ? 'Likod: Mga Tala at Sipi' : 'Harap: BatStateU ID');
      return next;
    });
  }, [onToast]);

  // 60+ FPS Physics loop
  useEffect(() => {
    let lastTime = performance.now();

    const updatePhysics = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const p = physicsRef.current;
      const targetFlip = isFlippedRef.current ? 180 : 0;

      if (isDraggingRef.current) {
        // Dragging mode: follow pointer with velocity tracking
        const dragVx = p.x - p.prevDragX;
        const dragVy = p.y - p.prevDragY;
        p.prevDragX = p.x;
        p.prevDragY = p.y;
        p.vx = dragVx / Math.max(dt, 0.016);
        p.vy = dragVy / Math.max(dt, 0.016);

        const targetRotZ = Math.max(-45, Math.min(45, p.x * 0.20 + p.vx * 0.032));
        const targetRotX = Math.max(-32, Math.min(32, -p.vy * 0.042 + p.y * 0.05));
        const targetRotY = targetFlip + Math.max(-40, Math.min(40, p.vx * 0.055));

        p.rotZ += (targetRotZ - p.rotZ) * 0.38;
        p.rotX += (targetRotX - p.rotX) * 0.38;
        p.rotY += (targetRotY - p.rotY) * 0.38;
      } else {
        // Free physics simulation: Spring-Damper Pendulum
        const springK = 34.0;
        const damping = 4.2;

        // Position restoring forces
        const fx = -springK * p.x - damping * p.vx;
        const fy = -springK * p.y - damping * p.vy;

        p.vx += fx * dt;
        p.vy += fy * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Subtle hover reaction when mouse is nearby
        let hoverAddX = 0;
        let hoverAddY = 0;
        if (mouseHoverRef.current.isHovering) {
          hoverAddY = mouseHoverRef.current.x * 12;
          hoverAddX = -mouseHoverRef.current.y * 9;
        }

        // RotZ pendulum restoring force
        const pendulumTargetAngle = Math.max(-46, Math.min(46, (p.x / REST_LENGTH) * 36));
        const rotZSpring = 32.0;
        const rotZDamp = 4.8;
        p.vRotZ += (-rotZSpring * (p.rotZ - pendulumTargetAngle) - rotZDamp * p.vRotZ) * dt;
        p.rotZ += p.vRotZ * dt;

        // RotX pitch restoring force
        const rotXSpring = 24.0;
        const rotXDamp = 4.4;
        p.vRotX += (-rotXSpring * (p.rotX - hoverAddX) - rotXDamp * p.vRotX) * dt;
        p.rotX += p.vRotX * dt;

        // RotY yaw/flip restoring force
        const rotYSpring = 28.0;
        const rotYDamp = 4.5;
        p.vRotY += (-rotYSpring * (p.rotY - (targetFlip + hoverAddY)) - rotYDamp * p.vRotY) * dt;
        p.rotY += p.vRotY * dt;
      }

      // Mathematical joint position (Punch hole of the ID card)
      const jointX = ANCHOR_X + p.x;
      const jointY = ANCHOR_Y + REST_LENGTH + p.y;

      // Buckle sits 64px above the punch hole
      const buckleX = jointX;
      const buckleY = jointY - 64;

      // Dynamic curve for the two lanyard straps
      const dist = Math.hypot(p.x, REST_LENGTH + p.y);
      const slack = Math.max(0, REST_LENGTH - dist) * 0.45;

      // Left strap curve: (ANCHOR_X - 24, 0) -> (buckleX - 9, buckleY)
      const lP0x = ANCHOR_X - 24;
      const lP0y = 0;
      const lP3x = buckleX - 9;
      const lP3y = buckleY;
      const lCp1x = lP0x + p.x * 0.2;
      const lCp1y = buckleY * 0.45 + slack;
      const lCp2x = lP0x + p.x * 0.75;
      const lCp2y = buckleY * 0.8 + slack * 0.5;
      const leftD = `M ${lP0x} ${lP0y} C ${lCp1x} ${lCp1y}, ${lCp2x} ${lCp2y}, ${lP3x} ${lP3y}`;

      // Right strap curve: (ANCHOR_X + 24, 0) -> (buckleX + 9, buckleY)
      const rP0x = ANCHOR_X + 24;
      const rP0y = 0;
      const rP3x = buckleX + 9;
      const rP3y = buckleY;
      const rCp1x = rP0x + p.x * 0.2;
      const rCp1y = buckleY * 0.45 + slack;
      const rCp2x = rP0x + p.x * 0.75;
      const rCp2y = buckleY * 0.8 + slack * 0.5;
      const rightD = `M ${rP0x} ${rP0y} C ${rCp1x} ${rCp1y}, ${rCp2x} ${rCp2y}, ${rP3x} ${rP3y}`;

      setStrapPaths({ leftD, rightD });

      // Update Buckle & Clasp Assembly (rotates subtly with swing)
      if (assemblyRef.current) {
        const assemblyTilt = p.rotZ * 0.82;
        assemblyRef.current.style.transform = `translate3d(${jointX}px, ${jointY}px, 0) rotateZ(${assemblyTilt}deg)`;
      }

      // Update 3D Card Position & Rotation (Transform-origin is 50% 29px, perfectly at punch hole!)
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${jointX}px, ${jointY}px, 0) translate(-50%, -29px) rotateZ(${p.rotZ}deg) rotateX(${p.rotX}deg) rotateY(${p.rotY}deg)`;

        const shadowBlur = Math.max(16, 36 - p.y * 0.08);
        const shadowOpacity = Math.max(0.14, 0.38 - Math.abs(p.y) * 0.001 - Math.abs(p.x) * 0.001);
        const shadowScale = Math.max(0.72, 1 - p.y * 0.002);
        cardRef.current.style.setProperty('--shadow-blur', `${shadowBlur}px`);
        cardRef.current.style.setProperty('--shadow-opacity', `${shadowOpacity}`);
        cardRef.current.style.setProperty('--shadow-scale', `${shadowScale}`);
      }

      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Pointer Down (Mouse click or Touch start)
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.button !== undefined) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    isDraggingRef.current = true;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };

    const currentX = physicsRef.current.x;
    const currentY = physicsRef.current.y;
    grabOffsetRef.current = {
      x: e.clientX - (rect.left + ANCHOR_X + currentX),
      y: e.clientY - (rect.top + REST_LENGTH + currentY)
    };
    physicsRef.current.prevDragX = currentX;
    physicsRef.current.prevDragY = currentY;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Pointer Move (Mouse drag or Touch drag)
  const handlePointerMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isDraggingRef.current) {
      const centerX = rect.left + ANCHOR_X;
      const centerY = rect.top + REST_LENGTH;

      const rawX = e.clientX - centerX - grabOffsetRef.current.x;
      const rawY = e.clientY - centerY - grabOffsetRef.current.y;

      // Soft limits for drag
      physicsRef.current.x = Math.max(-230, Math.min(230, rawX));
      physicsRef.current.y = Math.max(-120, Math.min(240, rawY));
    } else {
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseHoverRef.current = {
        x: Math.max(-1, Math.min(1, normX)),
        y: Math.max(-1, Math.min(1, normY)),
        isHovering: true
      };
    }
  };

  // Pointer Up (Release or Click)
  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const deltaX = Math.abs(e.clientX - pointerStartRef.current.x);
    const deltaY = Math.abs(e.clientY - pointerStartRef.current.y);
    const deltaTime = Date.now() - pointerStartRef.current.time;

    // Quick click with minimal drag -> Flip card!
    if (deltaX < 8 && deltaY < 8 && deltaTime < 350) {
      toggleFlip();
    }
  };

  const handlePointerLeave = () => {
    mouseHoverRef.current.isHovering = false;
  };

  return (
    <div className="lanyard-showcase-stage" aria-label="Interactive 3D ID Badge ni Eliza">
      {/* Sleek Line Mount Ring - Sits directly on the section divider line */}
      <div className="lanyard-line-ring" aria-hidden="true"></div>

      {/* Main 3D Physics Viewport */}
      <div
        className="lanyard-physics-viewport"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        role="region"
        aria-roledescription="Interactive 3D ID Card"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
          }
        }}
      >
        {/* Dynamic Curved ELIMENTS Twin Lanyard Straps */}
        <svg
          className="lanyard-strap-canvas"
          viewBox={`0 0 ${STAGE_W} 720`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Ribbon Drop Shadow */}
            <filter id="ribbonGlowShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="2" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.32" />
            </filter>

            {/* Left Strap: ELIMENTS Deep Maroon Fabric */}
            <linearGradient id="elimentsMaroonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2a0505" />
              <stop offset="18%" stopColor="#4a0e0e" />
              <stop offset="50%" stopColor="#6b1515" />
              <stop offset="82%" stopColor="#4a0e0e" />
              <stop offset="100%" stopColor="#2a0505" />
            </linearGradient>

            {/* Right Strap: ELIMENTS Warm Bone / Cream Fabric */}
            <linearGradient id="elementsCreamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c4b5a0" />
              <stop offset="18%" stopColor="#ddd0be" />
              <stop offset="50%" stopColor="#f0e6d6" />
              <stop offset="82%" stopColor="#ddd0be" />
              <stop offset="100%" stopColor="#c4b5a0" />
            </linearGradient>
          </defs>

          {/* 1. Left Strap Shadow */}
          <path
            d={strapPaths.leftD}
            fill="none"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="28"
            strokeLinecap="round"
            filter="url(#ribbonGlowShadow)"
          />

          {/* 2. Right Strap Shadow */}
          <path
            d={strapPaths.rightD}
            fill="none"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="28"
            strokeLinecap="round"
            filter="url(#ribbonGlowShadow)"
          />

          {/* 3. Left Strap Body (ELIMENTS Maroon) */}
          <path
            d={strapPaths.leftD}
            fill="none"
            stroke="url(#elimentsMaroonGradient)"
            strokeWidth="25"
            strokeLinecap="square"
          />
          {/* Left Strap Cream Pinstripe */}
          <path
            d={strapPaths.leftD}
            fill="none"
            stroke="#f0e6d6"
            strokeWidth="2.4"
            strokeDasharray="11 4"
          />

          {/* 4. Right Strap Body (Warm Cream) */}
          <path
            d={strapPaths.rightD}
            fill="none"
            stroke="url(#elementsCreamGradient)"
            strokeWidth="25"
            strokeLinecap="square"
          />
          {/* Right Strap Maroon Pinstripe */}
          <path
            d={strapPaths.rightD}
            fill="none"
            stroke="#4a0e0e"
            strokeWidth="2.4"
            strokeDasharray="11 4"
          />

          {/* 5. Typography along curves */}
          <path id="leftTextGuide" d={strapPaths.leftD} fill="none" stroke="transparent" />
          <path id="rightTextGuide" d={strapPaths.rightD} fill="none" stroke="transparent" />

          {/* Left Text: ELIMENTS */}
          <text
            fill="#f0e6d6"
            fontSize="10.5"
            fontFamily="'Space Mono', monospace"
            fontWeight="700"
            letterSpacing="4.5"
            dy="3.6"
          >
            <textPath href="#leftTextGuide" xlinkHref="#leftTextGuide" startOffset="48%" textAnchor="middle">
              ELIMENTS
            </textPath>
          </text>

          {/* Right Text: ELIMENTS */}
          <text
            fill="#4a0e0e"
            fontSize="10.5"
            fontFamily="'Space Mono', monospace"
            fontWeight="700"
            letterSpacing="4.5"
            dy="3.4"
          >
            <textPath href="#rightTextGuide" xlinkHref="#rightTextGuide" startOffset="48%" textAnchor="middle">
              ELIMENTS
            </textPath>
          </text>
        </svg>

        {/* ================= CLASP, TAB & BUCKLE ASSEMBLY ================= */}
        {/* Origin is at (0, 0) which is EXACTLY the card punch hole (jointX, jointY) */}
        <div className="lanyard-joint-assembly" ref={assemblyRef} aria-hidden="true">
          {/* Black Quick-Release Side Buckle (sits at y: -64px) */}
          <div className="lanyard-buckle-module">
            <div className="buckle-top-bar"></div>
            <div className="buckle-main-case">
              <span className="buckle-release-side left"></span>
              <span className="buckle-release-side right"></span>
              <div className="buckle-center-groove"></div>
            </div>
          </div>

          {/* Maroon Ribbon Tab with ELIMENTS Seal (sits between buckle and clasp) */}
          <div className="lanyard-tab-module">
            {/* Maroon Fabric Loop */}
            <div className="tab-fabric-ribbon">
              {/* Circular ELIMENTS Crest Emblem */}
              <div className="tab-seal-emblem">
                <div className="seal-inner-circle">
                  <div className="seal-spartan-shield"></div>
                </div>
              </div>
            </div>
            {/* Metallic Silver Rivet */}
            <div className="tab-metal-rivet"></div>
          </div>

          {/* Chrome Swivel Lobster Clasp Hook (Hook tip passes through y: 0 / punch hole) */}
          <div className="lanyard-metal-clasp-hook">
            {/* Swivel D-Ring */}
            <div className="clasp-swivel-ring"></div>
            {/* Lobster Clasp Body */}
            <div className="clasp-jaw-body">
              <div className="clasp-trigger-lever"></div>
              {/* The Hook Beak that passes into the card hole */}
              <div className="clasp-hook-beak"></div>
            </div>
          </div>
        </div>

        {/* Dynamic Floor Shadow */}
        <div className="lanyard-card-shadow" aria-hidden="true"></div>

        {/* ================= 3D DOUBLE-SIDED ID CARD (EXTRA LARGE) ================= */}
        {/* Transform-origin is precisely at 50% 29px (the punch hole) */}
        <div
          className={`lanyard-3d-card ${isFlipped ? 'is-flipped' : ''}`}
          ref={cardRef}
        >
          {/* FRONT FACE (Batangas State University ID ni Eliza) */}
          <div className="card-face card-face-front">
            <img
              src="/img/ID NI ELISSS.png"
              alt="ID ni Eliza - Harap (Batangas State University)"
              className="id-photo-surface"
              draggable={false}
            />
            <div className="card-holo-sheen" aria-hidden="true"></div>
          </div>

          {/* BACK FACE (Satsat Nang Satsat Scrapbook / Notes ni Eliza) */}
          <div className="card-face card-face-back">
            <img
              src="/img/ID NI ELISSS LIKOD.png"
              alt="ID ni Eliza - Likod (Sat Sat Nang Satsat at Sipi)"
              className="id-photo-surface"
              draggable={false}
            />
            <div className="card-holo-sheen" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
