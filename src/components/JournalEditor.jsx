import React, { useState, useRef, useEffect, useMemo } from 'react';
import './JournalEditor.css';
import {
  IconFolder,
  IconFolderOpen,
  IconFolderPlus,
  IconFileText,
  IconSave,
  IconEdit,
  IconTrash,
  IconPrinter,
  IconShare,
  IconImage,
  IconSearch,
  IconCalendar,
  IconUser,
  IconComputer,
  IconGrid,
  IconList,
  IconEye,
  IconMaximize,
  IconHighlighter,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustify,
  IconListBullet,
  IconListNumber,
  IconUndo,
  IconRedo,
  IconPaperLines,
  IconFileBlank,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconRotateLeft,
  IconRotateRight
} from './Icons';

const FONT_OPTIONS = [
  { label: 'Space Mono (Homepage Monospace)', value: "'Space Mono', monospace" },
  { label: 'JetBrains Mono (Clean Monospace)', value: "'JetBrains Mono', monospace" },
  { label: 'Patrick Hand (Handwritten)', value: "'Patrick Hand', cursive" },
  { label: 'Caveat (Casual Script)', value: "'Caveat', cursive" },
  { label: 'Pinyon Script (Calligraphy)', value: "'Pinyon Script', cursive" },
  { label: 'Playfair Display (Editorial Serif)', value: "'Playfair Display', serif" },
  { label: 'Bebas Neue (Bold Condensed)', value: "'Bebas Neue', sans-serif" },
  { label: 'Arial / Sans Serif', value: 'Arial, sans-serif' },
  { label: 'Georgia / Classic Serif', value: 'Georgia, serif' }
];

const INITIAL_FOLDERS = ['Personal', 'Mga Tala at Tula', 'Alaala at Paghinga', 'Liham at Sipi'];

export default function JournalEditor({ mode = 'writer', onToast, onBackToHome }) {
  const isReaderMode = mode === 'reader';
  const editorRef = useRef(null);
  const paperRef = useRef(null);
  const fileInputRef = useRef(null);

  // Formatting state
  const [currentFont, setCurrentFont] = useState("'Space Mono', monospace");
  const [currentFontSize, setCurrentFontSize] = useState(18);
  const [selectedFormatBlock, setSelectedFormatBlock] = useState('p');
  const [textColor, setTextColor] = useState('#222222');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [isLinedPaper, setIsLinedPaper] = useState(true);

  // Journal details
  const [journalTitle, setJournalTitle] = useState('ang aking talaarawan');
  const [journalSubtitle, setJournalSubtitle] = useState('isang malayang paghinga at pagsasalaysay');
  const [authorName, setAuthorName] = useState('Steven');
  const [entryDate, setEntryDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('fil-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Track if current writing is an existing entry being edited
  const [editingEntryId, setEditingEntryId] = useState(null);

  // Uploaded images state
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);

  // Dragging & Resizing state
  const [interactionState, setInteractionState] = useState(null);

  // Saved journals archive / localStorage
  const [savedEntries, setSavedEntries] = useState(() => {
    try {
      const stored = localStorage.getItem('iza_dalwa_journals');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed.map((item, idx) => ({
        ...item,
        entryNumber: item.entryNumber || idx + 1,
        folder: item.folder || 'Personal'
      }));
    } catch {
      return [];
    }
  });

  // Custom user-created folders
  const [customFolders, setCustomFolders] = useState(() => {
    try {
      const stored = localStorage.getItem('iza_dalwa_folders');
      return stored ? JSON.parse(stored) : INITIAL_FOLDERS;
    } catch {
      return INITIAL_FOLDERS;
    }
  });

  // Save Modal States (Desktop "Save As..." Dialog)
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFolder, setSaveFolder] = useState('Personal');
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [saveEntryNumber, setSaveEntryNumber] = useState(1);
  const [saveModalTitle, setSaveModalTitle] = useState('');
  const [saveModalSubtitle, setSaveModalSubtitle] = useState('');

  // Desktop File Manager States
  const [showArchiveModal, setShowArchiveModal] = useState(mode === 'reader');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('Lahat');
  const [fileViewMode, setFileViewMode] = useState('grid'); // 'grid' | 'details'
  const [sortBy, setSortBy] = useState('number-asc'); // 'number-asc' | 'number-desc' | 'alpha-asc' | 'alpha-desc' | 'date-newest'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSidebarNewFolder, setShowSidebarNewFolder] = useState(false);
  const [newFolderSidebarText, setNewFolderSidebarText] = useState('');
  const [mobileExplorerTab, setMobileExplorerTab] = useState('files'); // 'folders' | 'files' | 'preview'

  // Full letter preview modal
  const [previewingEntry, setPreviewingEntry] = useState(null);
  const [sharingEntry, setSharingEntry] = useState(null);

  // Execute formatting command
  const formatDoc = (cmd, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val);
  };

  // Font Family change
  const handleFontChange = (fontVal) => {
    setCurrentFont(fontVal);
    formatDoc('fontName', fontVal);
  };

  // Font Size change
  const handleFontSizeChange = (delta) => {
    const newSize = Math.max(12, Math.min(60, currentFontSize + delta));
    setCurrentFontSize(newSize);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const span = document.createElement('span');
      span.style.fontSize = `${newSize}px`;
      const range = selection.getRangeAt(0);
      try {
        range.surroundContents(span);
      } catch {
        formatDoc('fontSize', '4');
      }
    } else if (editorRef.current) {
      editorRef.current.style.fontSize = `${newSize}px`;
    }
  };

  // Paragraph format block
  const handleBlockChange = (blockTag) => {
    setSelectedFormatBlock(blockTag);
    formatDoc('formatBlock', blockTag);
  };

  // Text Color
  const handleTextColorChange = (color) => {
    setTextColor(color);
    formatDoc('foreColor', color);
  };

  // Highlight Color
  const handleHighlightChange = (color) => {
    setHighlightColor(color);
    if (color === 'transparent') {
      formatDoc('removeFormat');
    } else {
      formatDoc('hiliteColor', color);
    }
  };

  // Image Upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast?.('Mangyaring pumili ng larawan (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      const newImg = {
        id: 'img_' + Date.now(),
        src: uploadEvt.target.result,
        x: 40 + (images.length % 5) * 30,
        y: 80 + (images.length % 5) * 30,
        width: 240,
        height: 'auto',
        rotation: (Math.random() * 8 - 4).toFixed(1),
        frameStyle: 'tape',
        zIndex: images.length + 10
      };
      setImages((prev) => [...prev, newImg]);
      setSelectedImageId(newImg.id);
      onToast?.('Nai-upload ang larawan! Pwede mo itong i-drag at i-resize.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Dragging & Resizing Pointer Handlers
  const handlePointerDownImage = (e, img) => {
    e.stopPropagation();
    setSelectedImageId(img.id);

    setImages((prev) =>
      prev.map((item) =>
        item.id === img.id
          ? { ...item, zIndex: Math.max(...prev.map((i) => i.zIndex || 1), 1) + 1 }
          : item
      )
    );

    setInteractionState({
      type: 'drag',
      imageId: img.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: img.x,
      initialY: img.y
    });
  };

  const handlePointerDownHandle = (e, img, handle) => {
    e.stopPropagation();
    setSelectedImageId(img.id);

    setInteractionState({
      type: 'resize',
      imageId: img.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: img.x,
      initialY: img.y,
      initialW: typeof img.width === 'number' ? img.width : 240,
      initialH: typeof img.height === 'number' ? img.height : 240
    });
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!interactionState) return;

      const { type, imageId, startX, startY, initialX, initialY, initialW, initialH, handle } =
        interactionState;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (type === 'drag') {
        setImages((prev) =>
          prev.map((img) => {
            if (img.id !== imageId) return img;
            const newX = Math.max(0, initialX + deltaX);
            const newY = Math.max(0, initialY + deltaY);
            return { ...img, x: newX, y: newY };
          })
        );
      } else if (type === 'resize') {
        setImages((prev) =>
          prev.map((img) => {
            if (img.id !== imageId) return img;
            let newW = initialW;
            let newX = initialX;
            let newY = initialY;

            if (handle === 'se') {
              newW = Math.max(80, Math.min(800, initialW + deltaX));
            } else if (handle === 'sw') {
              const proposedW = Math.max(80, Math.min(800, initialW - deltaX));
              newW = proposedW;
              newX = initialX + (initialW - proposedW);
            } else if (handle === 'ne') {
              newW = Math.max(80, Math.min(800, initialW + deltaX));
              newY = initialY + deltaY;
            } else if (handle === 'nw') {
              const proposedW = Math.max(80, Math.min(800, initialW - deltaX));
              newW = proposedW;
              newX = initialX + (initialW - proposedW);
              newY = initialY + deltaY;
            }

            return { ...img, width: newW, height: 'auto', x: newX, y: newY };
          })
        );
      }
    };

    const handlePointerUp = () => {
      if (interactionState) {
        setInteractionState(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [interactionState]);

  // Update image properties from quick toolbar
  const updateSelectedImage = (patch) => {
    if (!selectedImageId) return;
    setImages((prev) =>
      prev.map((img) => (img.id === selectedImageId ? { ...img, ...patch } : img))
    );
  };

  const removeSelectedImage = () => {
    if (!selectedImageId) return;
    setImages((prev) => prev.filter((img) => img.id !== selectedImageId));
    setSelectedImageId(null);
    onToast?.('Naalis ang larawan sa papel.');
  };

  // Open the "Desktop Save As..." dialog
  const handleOpenSaveDialog = () => {
    const content = editorRef.current?.innerHTML || '';
    if (!content.trim() && images.length === 0) {
      onToast?.('Walang nakasulat sa journal para i-save.');
      return;
    }

    setSaveModalTitle(journalTitle || 'Walang Pamagat');
    setSaveModalSubtitle(journalSubtitle || '');

    if (editingEntryId) {
      const existing = savedEntries.find((e) => e.id === editingEntryId);
      if (existing) {
        setSaveFolder(existing.folder || 'Personal');
        setSaveEntryNumber(existing.entryNumber || 1);
      }
    } else {
      const nextNum =
        (savedEntries.reduce((max, e) => Math.max(max, Number(e.entryNumber) || 0), 0) ||
          savedEntries.length) + 1;
      setSaveEntryNumber(nextNum);
    }
    setShowSaveModal(true);
  };

  // Add a new folder
  const handleCreateNewFolder = (name) => {
    if (isReaderMode) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!customFolders.includes(trimmed)) {
      const updated = [...customFolders, trimmed];
      setCustomFolders(updated);
      try {
        localStorage.setItem('iza_dalwa_folders', JSON.stringify(updated));
      } catch (e) {}
      onToast?.(`Nalikha ang bagong folder: "${trimmed}"`);
    }
    setSaveFolder(trimmed);
    setSelectedFolderFilter(trimmed);
  };

  // Confirm Saving to Folder
  const handleConfirmSave = (isUpdateCurrent = false) => {
    if (isReaderMode) return;
    let chosenFolder = saveFolder;
    if (newFolderNameInput.trim()) {
      handleCreateNewFolder(newFolderNameInput.trim());
      chosenFolder = newFolderNameInput.trim();
      setNewFolderNameInput('');
    }

    const content = editorRef.current?.innerHTML || '';
    const num = Number(saveEntryNumber) || 1;

    if (editingEntryId && isUpdateCurrent) {
      // Update existing entry
      const updated = savedEntries.map((entry) => {
        if (entry.id === editingEntryId) {
          return {
            ...entry,
            title: saveModalTitle || 'Walang Pamagat',
            subtitle: saveModalSubtitle || '',
            folder: chosenFolder,
            entryNumber: num,
            author: authorName,
            date: entryDate,
            content,
            images,
            font: currentFont,
            updatedAt: new Date().toISOString()
          };
        }
        return entry;
      });
      setSavedEntries(updated);
      try {
        localStorage.setItem('iza_dalwa_journals', JSON.stringify(updated));
      } catch (err) {}
      setJournalTitle(saveModalTitle);
      setJournalSubtitle(saveModalSubtitle);
      setShowSaveModal(false);
      onToast?.(`Na-update ang Tala #${num} sa folder na "${chosenFolder}"!`);
      setSelectedFileId(editingEntryId);
      setShowArchiveModal(true);
      return;
    }

    // Save as new entry in folder
    const newEntry = {
      id: 'entry_' + Date.now(),
      entryNumber: num,
      folder: chosenFolder,
      title: saveModalTitle || 'Walang Pamagat',
      subtitle: saveModalSubtitle || '',
      author: authorName,
      date: entryDate,
      content,
      images,
      font: currentFont,
      createdAt: new Date().toISOString()
    };

    const updated = [newEntry, ...savedEntries];
    setSavedEntries(updated);
    try {
      localStorage.setItem('iza_dalwa_journals', JSON.stringify(updated));
    } catch (err) {}
    setJournalTitle(saveModalTitle);
    setJournalSubtitle(saveModalSubtitle);
    setEditingEntryId(newEntry.id);
    setSelectedFileId(newEntry.id);
    setShowSaveModal(false);
    onToast?.(`Naitabi sa folder na "${chosenFolder}" bilang Tala #${num}!`);
    setShowArchiveModal(true);
  };

  // Load entry into editor via "EDIT NOW"
  const handleEditNow = (entry) => {
    if (isReaderMode) return;
    setEditingEntryId(entry.id);
    setJournalTitle(entry.title || '');
    setJournalSubtitle(entry.subtitle || '');
    setAuthorName(entry.author || '');
    setEntryDate(entry.date || '');
    if (editorRef.current) {
      editorRef.current.innerHTML = entry.content || '';
    }
    setImages(entry.images || []);
    if (entry.font) {
      setCurrentFont(entry.font);
    }
    setPreviewingEntry(null);
    setShowArchiveModal(false);
    onToast?.(`Handa nang i-edit ang Tala #${entry.entryNumber}: "${entry.title}"`);
    paperRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Delete an entry from folder
  const handleDeleteEntry = (entryId, title) => {
    if (isReaderMode) return;
    if (window.confirm(`Sigurado ka bang nais mong burahin ang "${title}"?`)) {
      const filtered = savedEntries.filter((e) => e.id !== entryId);
      setSavedEntries(filtered);
      try {
        localStorage.setItem('iza_dalwa_journals', JSON.stringify(filtered));
      } catch (err) {}
      if (previewingEntry?.id === entryId) {
        setPreviewingEntry(null);
      }
      if (selectedFileId === entryId) {
        setSelectedFileId(filtered[0]?.id || null);
      }
      if (editingEntryId === entryId) {
        setEditingEntryId(null);
      }
      onToast?.('Nabura ang sulat sa folder.');
    }
  };

  // Clear paper
  const handleClear = () => {
    if (window.confirm('Nais mo bang linisin ang buong papel at magsimula ng bago?')) {
      if (editorRef.current) editorRef.current.innerHTML = '';
      setImages([]);
      setSelectedImageId(null);
      setEditingEntryId(null);
      setJournalTitle('ang aking talaarawan');
      setJournalSubtitle('isang malayang paghinga at pagsasalaysay');
      onToast?.('Nalinis ang papel. Handa nang magsulat ng panibagong tala.');
    }
  };

  // Print / Export
  const handlePrint = () => {
    window.print();
  };

  const createStoryImage = async (entry) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Hindi makagawa ng Story image sa browser na ito.');
    }

    context.fillStyle = '#f4f1e8';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#7f1616';
    context.fillRect(0, 0, 28, canvas.height);
    context.fillRect(88, 130, 904, 8);

    const drawWrappedText = (text, x, y, maxWidth, lineHeight, maxLines) => {
      const words = text.split(/\s+/).filter(Boolean);
      let line = '';
      let linesDrawn = 0;
      for (const word of words) {
        const nextLine = line ? `${line} ${word}` : word;
        if (context.measureText(nextLine).width > maxWidth && line) {
          if (linesDrawn === maxLines - 1) {
            context.fillText(`${line.slice(0, Math.max(0, line.length - 3))}...`, x, y);
            return y + lineHeight;
          }
          context.fillText(line, x, y);
          y += lineHeight;
          linesDrawn += 1;
          line = word;
        } else {
          line = nextLine;
        }
      }
      if (line && linesDrawn < maxLines) {
        context.fillText(line, x, y);
        y += lineHeight;
      }
      return y;
    };

    context.fillStyle = '#7f1616';
    context.font = '700 28px monospace';
    context.fillText(`TALA #${entry.entryNumber || ''}`, 100, 220);

    context.fillStyle = '#18191b';
    context.font = '700 64px Georgia, serif';
    let y = drawWrappedText(entry.title || 'Walang Pamagat', 100, 340, 880, 78, 3);

    if (entry.subtitle) {
      context.fillStyle = '#52555c';
      context.font = '32px Georgia, serif';
      y = drawWrappedText(entry.subtitle, 100, y + 20, 880, 44, 3);
    }

    context.fillStyle = '#7f1616';
    context.fillRect(100, y + 18, 120, 4);
    context.fillStyle = '#24262a';
    context.font = '36px Georgia, serif';
    const plainContent = document.createElement('div');
    plainContent.innerHTML = entry.content || '';
    const excerpt = (plainContent.textContent || '').replace(/\s+/g, ' ').trim();
    if (excerpt) {
      y = drawWrappedText(`“${excerpt}”`, 100, y + 100, 880, 54, 14);
    } else {
      y += 100;
    }

    context.fillStyle = '#52555c';
    context.font = '26px monospace';
    context.fillText(entry.author || 'iza.dalwa.taklo', 100, Math.min(y + 60, 1740));
    context.fillText(entry.date || '', 100, Math.min(y + 104, 1790));

    context.fillStyle = '#7f1616';
    context.font = '700 24px monospace';
    context.fillText('IZA.DALWA.TAKLO', 100, 1840);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Hindi nagawa ang Story image. Subukan muli.'));
        }
      }, 'image/png');
    });

    const fileName = `tala-${entry.entryNumber || 'story'}.png`;
    return new File([blob], fileName, { type: 'image/png' });
  };

  const handleDownloadStory = async () => {
    if (!sharingEntry) return;
    try {
      const file = await createStoryImage(sharingEntry);
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
      onToast?.('Na-download ang Story image. I-upload ito sa Instagram o Facebook Story.');
      setSharingEntry(null);
    } catch (error) {
      onToast?.(error.message || 'Hindi nagawa ang Story image.');
    }
  };

  const handleNativeStoryShare = async () => {
    if (!sharingEntry) return;
    try {
      const file = await createStoryImage(sharingEntry);
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: sharingEntry.title || 'Ibahagi ang sulat',
          text: 'Pumili ng Instagram o Facebook para ibahagi bilang Story.'
        });
        setSharingEntry(null);
      } else {
        await handleDownloadStory();
        return;
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        onToast?.(error.message || 'Hindi naibahagi ang Story image.');
      }
    }
  };

  // All folder names combined
  const allFolderNames = useMemo(() => {
    return Array.from(
      new Set([
        ...customFolders,
        ...savedEntries.map((e) => e.folder || 'Personal')
      ])
    );
  }, [customFolders, savedEntries]);

  // Filtered and Sorted entries
  const filteredEntries = useMemo(() => {
    return savedEntries.filter((e) => {
      const inFolder = selectedFolderFilter === 'Lahat' || (e.folder || 'Personal') === selectedFolderFilter;
      if (!inFolder) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (e.title || '').toLowerCase().includes(q) ||
        (e.subtitle || '').toLowerCase().includes(q) ||
        (e.author || '').toLowerCase().includes(q) ||
        (e.content || '').toLowerCase().includes(q)
      );
    });
  }, [savedEntries, selectedFolderFilter, searchQuery]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      if (sortBy === 'number-asc') {
        return (Number(a.entryNumber) || 0) - (Number(b.entryNumber) || 0);
      }
      if (sortBy === 'number-desc') {
        return (Number(b.entryNumber) || 0) - (Number(a.entryNumber) || 0);
      }
      if (sortBy === 'alpha-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'alpha-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (sortBy === 'date-newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });
  }, [filteredEntries, sortBy]);

  // Currently selected entry in File Explorer
  const selectedEntry = useMemo(() => {
    if (!selectedFileId) {
      return sortedEntries[0] || null;
    }
    return savedEntries.find((e) => e.id === selectedFileId) || sortedEntries[0] || null;
  }, [selectedFileId, savedEntries, sortedEntries]);

  const activeImage = images.find((i) => i.id === selectedImageId);

  return (
    <section
      className={`journal-writer-section ${isReaderMode ? 'reader-mode' : ''}`}
      id={isReaderMode ? 'basa-journal-section' : 'sulat-journal-section'}
    >
      {/* Striped Background Container (Red & White Editorial Stripes) */}
      <div className="journal-striped-backdrop">
        <div className="journal-backdrop-vignette"></div>

        {/* Outer Frame Wrapper */}
        <div className="journal-workspace-container">

          {/* Top Bar with Back to Home button */}
          <div className="journal-top-bar">
            <button
              type="button"
              className="journal-back-home-pill"
              onClick={onBackToHome}
            >
              <IconArrowLeft size={13} className="os-inline-icon" />
              <span>Bumalik sa Tahanan</span>
            </button>
            <button
              type="button"
              className="journal-top-brand"
              onClick={onBackToHome}
            >
              iza.dalwa.taklo
            </button>
          </div>

          {/* Section Banner Header */}
          <div className="journal-section-head">
            <span className="journal-tag-pill">
          {isReaderMode ? 'BAHAGI NG PAGBASA // MGA NAKAIMBAK NA SULAT' : 'BAHAGI NG PAGSULAT // SULAT AT TALAARAWAN'}
            </span>
            <p className="journal-subtext-intro">
              Dito malayang isulat ang liham, kaisipan, at damdamin. I-save sa sariling desktop file manager, i-organisa sa mga folder, at i-preview o i-edit muli anumang oras.
            </p>
          </div>

          {/* Status Indicator if currently editing a saved entry */}
          {editingEntryId && (
            <div className="editing-badge-banner">
              <IconEdit size={14} className="os-inline-icon" />
              <span>Kasalukuyang ine-edit ang Tala:</span>
              <strong>"{journalTitle}"</strong>
              <button
                type="button"
                className="btn-exit-edit"
                onClick={() => {
                  setEditingEntryId(null);
                  onToast?.('Naka-save mode na bilang bagong tala.');
                }}
                title="Gawing hiwalay na bagong sulat"
              >
                ✕ I-save bilang bago
              </button>
            </div>
          )}

          {sharingEntry && (
            <div className="journal-modal-overlay share-modal-overlay" onClick={() => setSharingEntry(null)}>
              <section
                className="share-story-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-story-title"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSharingEntry(null)}
                  aria-label="Isara ang share options"
                >
                  ✕
                </button>
                <span className="share-story-eyebrow">STORY IMAGE // 9:16</span>
                <h3 id="share-story-title">Ibahagi ang “{sharingEntry.title || 'Walang Pamagat'}”</h3>
                <p>
                  Gagawa ng portrait na larawan mula sa pamagat at sipi ng sulat. Sa mobile share menu,
                  piliin ang Instagram Story o Facebook Story kung available; kung wala, i-download ang
                  larawan at i-upload ito sa Story.
                </p>
                <div className="share-story-actions">
                  <button type="button" className="share-story-native" onClick={handleNativeStoryShare}>
                    <IconShare size={15} />
                    <span>I-share gamit ang device</span>
                  </button>
                  <button type="button" className="share-story-download" onClick={handleDownloadStory}>
                    <IconSave size={15} />
                    <span>I-download ang Story image</span>
                  </button>
                </div>
                <small>Hindi direktang nagpo-post ang website sa Instagram o Facebook.</small>
              </section>
            </div>
          )}

          {/* ========================================================
              LARGE STATIONERY PAPER CARD (White Form Card)
              ======================================================== */}
          <div
            className={`journal-paper-card ${isLinedPaper ? 'paper-lined' : 'paper-blank'}`}
            ref={paperRef}
            onClick={() => setSelectedImageId(null)}
          >
            {/* Washi Tape / Paper Stamp Accents on top corners */}
            <div className="washi-tape-strip tape-top-center" aria-hidden="true"></div>

            {/* Paper Header: Title, Subtitle, and Meta Underlines */}
            <div className="journal-paper-header">
              <input
                type="text"
                className="journal-title-handwritten"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                placeholder="isulat ang pamagat (title)..."
                title="I-click para palitan ang pamagat (title)"
              />

              <input
                type="text"
                className="journal-subtitle-input"
                value={journalSubtitle}
                onChange={(e) => setJournalSubtitle(e.target.value)}
                placeholder="isulat ang subtitle o maikling paglalarawan..."
                title="I-click para palitan ang subtitle"
              />

              {/* Lined Metadata fields like "name, email, message" */}
              <div className="journal-meta-underlines">
                <div className="meta-underline-row">
                  <label className="meta-label">may-akda:</label>
                  <input
                    type="text"
                    className="meta-line-input"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="iyong pangalan o bansag"
                  />
                </div>
                <div className="meta-underline-row">
                  <label className="meta-label">petsa:</label>
                  <input
                    type="text"
                    className="meta-line-input"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    placeholder="petsa ng sulat"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================
                GOOGLE DOCS STYLE TOOLBAR (Vector Icons!)
                ======================================================== */}
            <div
              className="gdocs-toolbar"
              onClick={(e) => e.stopPropagation()}
              role="toolbar"
              aria-label="Journal text formatting toolbar"
            >
              {/* Undo / Redo */}
              <div className="toolbar-group">
                <button
                  type="button"
                  className="tb-btn"
                  title="I-undo (Ctrl+Z)"
                  onClick={() => formatDoc('undo')}
                >
                  <IconUndo size={14} />
                </button>
                <button
                  type="button"
                  className="tb-btn"
                  title="I-redo (Ctrl+Y)"
                  onClick={() => formatDoc('redo')}
                >
                  <IconRedo size={14} />
                </button>
              </div>

              <div className="tb-divider" aria-hidden="true"></div>

              {/* Text Style / Block Format dropdown */}
              <div className="toolbar-group">
                <select
                  className="tb-select block-select"
                  value={selectedFormatBlock}
                  onChange={(e) => handleBlockChange(e.target.value)}
                  title="Estilo ng talata"
                >
                  <option value="p">Normal text</option>
                  <option value="h1">Title (Pamagat)</option>
                  <option value="h2">Subtitle (Pangalawa)</option>
                  <option value="h3">Heading 3</option>
                  <option value="blockquote">Quote / Sipi</option>
                </select>
              </div>

              <div className="tb-divider" aria-hidden="true"></div>

              {/* Font Family Dropdown */}
              <div className="toolbar-group">
                <select
                  className="tb-select font-select"
                  value={currentFont}
                  onChange={(e) => handleFontChange(e.target.value)}
                  title="Pumili ng Font"
                  style={{ fontFamily: currentFont }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tb-divider" aria-hidden="true"></div>

              {/* Font Size Decrement - Size Display - Increment */}
              <div className="toolbar-group size-stepper">
                <button
                  type="button"
                  className="tb-btn tb-step-btn"
                  title="Paliitin ang Font"
                  onClick={() => handleFontSizeChange(-2)}
                >
                  −
                </button>
                <span className="tb-size-value">{currentFontSize}</span>
                <button
                  type="button"
                  className="tb-btn tb-step-btn"
                  title="Palakihin ang Font"
                  onClick={() => handleFontSizeChange(2)}
                >
                  +
                </button>
              </div>

              <div className="tb-divider" aria-hidden="true"></div>

              {/* Basic Formatting: Bold, Italic, Underline, Strikethrough */}
              <div className="toolbar-group">
                <button
                  type="button"
                  className="tb-btn tb-bold"
                  title="Bold (Ctrl+B)"
                  onClick={() => formatDoc('bold')}
                >
                  <b>B</b>
                </button>
                <button
                  type="button"
                  className="tb-btn tb-italic"
                  title="Italic (Ctrl+I)"
                  onClick={() => formatDoc('italic')}
                >
                  <i>I</i>
                </button>
                <button
                  type="button"
                  className="tb-btn tb-underline"
                  title="Underline (Ctrl+U)"
                  onClick={() => formatDoc('underline')}
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  className="tb-btn tb-strike"
                  title="Strikethrough"
                  onClick={() => formatDoc('strikeThrough')}
                >
                  <s>S</s>
                </button>
              </div>

              <div className="tb-divider" aria-hidden="true"></div>

              {/* Text Color Picker */}
              <div className="toolbar-group color-group">
                <label className="tb-color-wrapper" title="Kulay ng Teksto (A)">
                  <span className="tb-color-letter" style={{ borderBottomColor: textColor }}>
                    A
                  </span>
                  <input
                    type="color"
                    className="tb-color-input"
                    value={textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                  />
                </label>
              </div>

              {/* Highlighter / Marker Color Picker */}
              <div className="toolbar-group color-group">
                <label className="tb-color-wrapper" title="Highlight Marker">
                  <span
                    className="tb-highlight-icon"
                    style={{ backgroundColor: highlightColor === 'transparent' ? '#fff59d' : highlightColor }}
                  >
                    <IconHighlighter size={13} />
                  </span>
                  <input
                    type="color"
                    className="tb-color-input"
                    value={highlightColor === 'transparent' ? '#fff59d' : highlightColor}
                    onChange={(e) => handleHighlightChange(e.target.value)}
                  />
                </label>
              </div>

              <div className="tb-divider" aria-hidden="true"></div>

              {/* Text Alignment */}
              <div className="toolbar-group">
                <button
                  type="button"
                  className="tb-btn"
                  title="Kaliwa (Align Left)"
                  onClick={() => formatDoc('justifyLeft')}
                >
                  <IconAlignLeft size={14} />
                </button>
                <button
                  type="button"
                  className="tb-btn"
                  title="Gitna (Center)"
                  onClick={() => formatDoc('justifyCenter')}
                >
                  <IconAlignCenter size={14} />
                </button>
                <button
                  type="button"
                  className="tb-btn"
                  title="Kanan (Align Right)"
                  onClick={() => formatDoc('justifyRight')}
                >
                  <IconAlignRight size={14} />
                </button>
                <button
                  type="button"
                  className="tb-btn"
                  title="Pantay (Justify)"
                  onClick={() => formatDoc('justifyFull')}
                >
                  <IconAlignJustify size={14} />
                </button>
              </div>

              <div className="tb-divider" aria-hidden="true"></div>

              {/* Lists */}
              <div className="toolbar-group">
                <button
                  type="button"
                  className="tb-btn"
                  title="Bulleted List"
                  onClick={() => formatDoc('insertUnorderedList')}
                >
                  <IconListBullet size={14} />
                </button>
                <button
                  type="button"
                  className="tb-btn"
                  title="Numbered List"
                  onClick={() => formatDoc('insertOrderedList')}
                >
                  <IconListNumber size={14} />
                </button>
              </div>

              <div className="tb-divider" aria-hidden="true"></div>

              {/* IMAGE UPLOAD BUTTON (Vector Icon!) */}
              <div className="toolbar-group">
                <button
                  type="button"
                  className="tb-btn tb-upload-btn"
                  title="Mag-upload ng Larawan sa Papel"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconImage size={15} />
                  <span className="tb-text-label">Magdagdag ng Larawan</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>

              {/* Lined Paper vs Blank Paper Toggle */}
              <div className="toolbar-group">
                <button
                  type="button"
                  className={`tb-btn tb-paper-toggle ${isLinedPaper ? 'tb-btn-active' : ''}`}
                  title={isLinedPaper ? 'Gawing Blank Canvas' : 'Gawing Lined Paper'}
                  onClick={() => setIsLinedPaper(!isLinedPaper)}
                >
                  {isLinedPaper ? (
                    <>
                      <IconPaperLines size={13} />
                      <span>May Guhit</span>
                    </>
                  ) : (
                    <>
                      <IconFileBlank size={13} />
                      <span>Blanko</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ========================================================
                WRITING PAPER CANVAS / CONTENTEDITABLE BODY
                ======================================================== */}
            <div className="journal-writing-canvas-wrap">

              {/* The Text Writing Area */}
              <div
                ref={editorRef}
                className="journal-editable-surface"
                contentEditable
                suppressContentEditableWarning
                style={{
                  fontFamily: currentFont,
                  fontSize: `${currentFontSize}px`,
                  color: textColor
                }}
                data-placeholder="Simulan dito ang iyong sulat, talaarawan, o malayang paghinga..."
              />

              {/* ========================================================
                  DRAGGABLE & RESIZABLE UPLOADED PICTURES OVERLAY
                  ======================================================== */}
              {images.map((img) => {
                const isSelected = selectedImageId === img.id;
                return (
                  <div
                    key={img.id}
                    className={`journal-placed-image-box frame-${img.frameStyle} ${
                      isSelected ? 'is-selected' : ''
                    }`}
                    style={{
                      transform: `translate(${img.x}px, ${img.y}px) rotate(${img.rotation}deg)`,
                      width: typeof img.width === 'number' ? `${img.width}px` : img.width,
                      zIndex: img.zIndex || 10
                    }}
                    onPointerDown={(e) => handlePointerDownImage(e, img)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Decorative tape sticker on top of photo */}
                    {img.frameStyle === 'tape' && (
                      <div className="photo-washi-tape" aria-hidden="true"></div>
                    )}

                    <img
                      src={img.src}
                      alt="Journal Attachment"
                      className="journal-photo-element"
                      draggable={false}
                    />

                    {/* Resizing Handles when selected */}
                    {isSelected && (
                      <>
                        <div
                          className="resize-handle handle-nw"
                          onPointerDown={(e) => handlePointerDownHandle(e, img, 'nw')}
                          title="I-drag para i-resize"
                        />
                        <div
                          className="resize-handle handle-ne"
                          onPointerDown={(e) => handlePointerDownHandle(e, img, 'ne')}
                          title="I-drag para i-resize"
                        />
                        <div
                          className="resize-handle handle-sw"
                          onPointerDown={(e) => handlePointerDownHandle(e, img, 'sw')}
                          title="I-drag para i-resize"
                        />
                        <div
                          className="resize-handle handle-se"
                          onPointerDown={(e) => handlePointerDownHandle(e, img, 'se')}
                          title="I-drag para i-resize"
                        />
                        <div className="photo-drag-hint">
                          <span>I-drag para ilipat</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

            </div>

            {/* ========================================================
                FLOATING QUICK CONTROLS FOR SELECTED IMAGE
                ======================================================== */}
            {activeImage && (
              <div
                className="selected-image-floating-bar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="img-bar-group">
                  <span className="img-bar-label">Laki (Resize):</span>
                  <input
                    type="range"
                    min="100"
                    max="650"
                    value={typeof activeImage.width === 'number' ? activeImage.width : 240}
                    onChange={(e) => updateSelectedImage({ width: Number(e.target.value) })}
                    className="img-range-slider"
                  />
                  <span className="img-px-tag">{Math.round(activeImage.width)}px</span>
                </div>

                <div className="img-bar-divider"></div>

                <div className="img-bar-group">
                  <span className="img-bar-label">Ikutin (Rotate):</span>
                  <button
                    type="button"
                    className="img-bar-btn"
                    onClick={() => updateSelectedImage({ rotation: Number(activeImage.rotation || 0) - 5 })}
                    title="Paikutin pakaliwa"
                  >
                    <IconRotateLeft size={12} className="os-inline-icon" /> -5°
                  </button>
                  <button
                    type="button"
                    className="img-bar-btn"
                    onClick={() => updateSelectedImage({ rotation: 0 })}
                    title="I-reset ang posisyon"
                  >
                    0°
                  </button>
                  <button
                    type="button"
                    className="img-bar-btn"
                    onClick={() => updateSelectedImage({ rotation: Number(activeImage.rotation || 0) + 5 })}
                    title="Paikutin pakanan"
                  >
                    <IconRotateRight size={12} className="os-inline-icon" /> +5°
                  </button>
                </div>

                <div className="img-bar-divider"></div>

                <div className="img-bar-group">
                  <span className="img-bar-label">Frame:</span>
                  <select
                    className="img-bar-select"
                    value={activeImage.frameStyle}
                    onChange={(e) => updateSelectedImage({ frameStyle: e.target.value })}
                  >
                    <option value="tape">Washi Tape</option>
                    <option value="polaroid">Polaroid</option>
                    <option value="clean">Simple Border</option>
                    <option value="shadow">Drop Shadow</option>
                  </select>
                </div>

                <div className="img-bar-divider"></div>

                <button
                  type="button"
                  className="img-bar-btn btn-delete-img"
                  onClick={removeSelectedImage}
                  title="Tanggalin ang larawan"
                >
                  <IconTrash size={12} className="os-inline-icon" /> Alisin
                </button>
              </div>
            )}

            {/* ========================================================
                ACTION BUTTONS (Vector Icons!)
                ======================================================== */}
            <div className="journal-bottom-actions">
              <button
                type="button"
                className="organic-pill-action-btn primary-action"
                onClick={handleOpenSaveDialog}
              >
                <IconSave size={15} className="os-btn-vector-icon" />
                <span>i-save sa folder</span>
              </button>

              <button
                type="button"
                className="organic-pill-action-btn"
                onClick={() => {
                  setPreviewingEntry(null);
                  setShowArchiveModal(true);
                }}
              >
                <IconFolder size={15} className="os-btn-vector-icon" />
                <span>file manager ({savedEntries.length})</span>
              </button>

              <button
                type="button"
                className="organic-pill-action-btn"
                onClick={handlePrint}
              >
                <IconPrinter size={15} className="os-btn-vector-icon" />
                <span>i-print / pdf</span>
              </button>

              <button
                type="button"
                className="organic-pill-action-btn btn-subtle"
                onClick={handleClear}
              >
                <IconFileBlank size={15} className="os-btn-vector-icon" />
                <span>bagong papel</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================
          DESKTOP "SAVE AS..." WINDOW DIALOG (Vector Icons!)
          ======================================================== */}
      {showSaveModal && (
        <div className="journal-modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="desktop-save-as-window" onClick={(e) => e.stopPropagation()}>
            {/* Desktop Window Titlebar */}
            <div className="os-window-titlebar">
              <div className="os-titlebar-meta">
                <IconSave size={14} className="os-window-icon" />
                <span className="os-window-name">Save As — I-save ang Tala sa Folder</span>
              </div>
              <div className="os-window-controls">
                <button
                  type="button"
                  className="os-win-btn"
                  onClick={() => setShowSaveModal(false)}
                >
                  ─
                </button>
                <button
                  type="button"
                  className="os-win-btn btn-close-win"
                  onClick={() => setShowSaveModal(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Dialog Path Selector Bar */}
            <div className="os-save-path-row">
              <span className="save-in-label">Save in:</span>
              <div className="save-in-dropdown-wrap">
                <select
                  className="os-save-folder-select"
                  value={saveFolder}
                  onChange={(e) => setSaveFolder(e.target.value)}
                >
                  {allFolderNames.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn-new-folder-icon"
                onClick={() => {
                  const name = prompt('Pangalan ng bagong folder:');
                  if (name) handleCreateNewFolder(name);
                }}
                title="Lumikha ng bagong folder"
              >
                <IconFolderPlus size={14} />
              </button>
            </div>

            {/* File Details Fields Form */}
            <div className="os-save-fields-area">
              <div className="os-dialog-field-row">
                <label className="os-dialog-label">File name (Pamagat):</label>
                <input
                  type="text"
                  className="os-dialog-input"
                  value={saveModalTitle}
                  onChange={(e) => setSaveModalTitle(e.target.value)}
                  placeholder="hal. Ang Paglingon sa Kahapon"
                  autoFocus
                />
              </div>

              <div className="os-dialog-field-row">
                <label className="os-dialog-label">Subtitle (Pangalawa):</label>
                <input
                  type="text"
                  className="os-dialog-input"
                  value={saveModalSubtitle}
                  onChange={(e) => setSaveModalSubtitle(e.target.value)}
                  placeholder="maikling paglalarawan o tema"
                />
              </div>

              <div className="os-dialog-field-row inline-split">
                <div className="field-half">
                  <label className="os-dialog-label">Entry Number (#):</label>
                  <input
                    type="number"
                    min="1"
                    className="os-dialog-input"
                    value={saveEntryNumber}
                    onChange={(e) => setSaveEntryNumber(e.target.value)}
                  />
                </div>
                <div className="field-half">
                  <label className="os-dialog-label">Save as type:</label>
                  <input
                    type="text"
                    className="os-dialog-input disabled-look"
                    value="Journal Document (*.journal)"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Desktop Dialog Buttons */}
            <div className="os-dialog-button-dock">
              {editingEntryId ? (
                <>
                  <button
                    type="button"
                    className="os-primary-dialog-btn"
                    onClick={() => handleConfirmSave(true)}
                  >
                    <IconSave size={13} className="os-inline-icon" />
                    <span>I-update ang Tala</span>
                  </button>
                  <button
                    type="button"
                    className="os-secondary-dialog-btn"
                    onClick={() => handleConfirmSave(false)}
                  >
                    <span>Save As Bagong Tala</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="os-primary-dialog-btn"
                  onClick={() => handleConfirmSave(false)}
                >
                  <IconSave size={13} className="os-inline-icon" />
                  <span>Save (Itabi)</span>
                </button>
              )}
              <button
                type="button"
                className="os-cancel-dialog-btn"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DESKTOP FILE MANAGER (Computer File Explorer / Finder Window)
          ======================================================== */}
      {showArchiveModal && (
        <div
          className={`journal-modal-overlay ${isReaderMode ? 'reader-mode-overlay' : ''}`}
          onClick={() => {
            if (isReaderMode) {
              onBackToHome?.();
            } else {
              setShowArchiveModal(false);
            }
          }}
        >
          <div
            className={`desktop-file-explorer-window ${isMaximized ? 'is-maximized' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Windows Title Bar */}
            <div className="os-titlebar">
              <div className="os-titlebar-left">
                <div className="os-window-dots">
                  <button
                    type="button"
                    className="dot dot-close"
                    onClick={() => {
                      if (isReaderMode) {
                        onBackToHome?.();
                      } else {
                        setShowArchiveModal(false);
                        setPreviewingEntry(null);
                      }
                    }}
                    title={isReaderMode ? 'Bumalik sa tahanan' : 'Close Explorer'}
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    className="dot dot-min"
                    onClick={() => setIsMaximized(false)}
                    title="Restore"
                  >
                    ─
                  </button>
                  <button
                    type="button"
                    className="dot dot-max"
                    onClick={() => setIsMaximized(!isMaximized)}
                    title="Maximize / Toggle Window"
                  >
                    ▢
                  </button>
                </div>
                <div className="os-window-title">
                  <IconFolder size={14} className="os-app-icon" />
                  <span>File Explorer — C:\iza.dalwa.taklo\Journals\{selectedFolderFilter}</span>
                </div>
              </div>

              <div className="os-titlebar-right">
                  <span className="os-status-pill">{isReaderMode ? 'READ ONLY // PREVIEW LANG' : 'DESKTOP FILE SYSTEM'}</span>
              </div>
            </div>

            {/* Address & Navigation Bar (Breadcrumbs & Search) */}
            <div className="os-address-bar-row">
              <div className="os-nav-arrows">
                <button
                  type="button"
                  className="os-arrow-btn"
                  onClick={() => setSelectedFolderFilter('Lahat')}
                  title="Bumalik sa Lahat"
                >
                  <IconArrowLeft size={13} />
                </button>
                <button
                  type="button"
                  className="os-arrow-btn"
                  onClick={() => setSelectedFolderFilter('Personal')}
                  title="Personal Folder"
                >
                  <IconArrowRight size={13} />
                </button>
                <button
                  type="button"
                  className="os-arrow-btn"
                  onClick={() => setSelectedFolderFilter('Lahat')}
                  title="Root Directory"
                >
                  <IconArrowUp size={13} />
                </button>
              </div>

              {/* Breadcrumb Path Box */}
              <div className="os-path-box">
                <span className="path-segment" onClick={() => setSelectedFolderFilter('Lahat')}>
                  <IconComputer size={13} className="os-inline-icon" /> Computer
                </span>
                <span className="path-sep">/</span>
                <span className="path-segment">Documents</span>
                <span className="path-sep">/</span>
                <span className="path-segment">Journals</span>
                <span className="path-sep">/</span>
                <span className="path-segment active-folder">
                  <IconFolder size={12} className="os-inline-icon" /> {selectedFolderFilter}
                </span>
              </div>

              {/* Search Box */}
              <div className="os-search-box">
                <IconSearch size={13} className="search-icon" />
                <input
                  type="text"
                  className="os-search-input"
                  placeholder="Maghanap sa tala..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="btn-clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Toolbar Ribbon Bar */}
            <div className="os-toolbar-ribbon">
              <div className="os-ribbon-left">
                {!isReaderMode && <button
                  type="button"
                  className="os-ribbon-btn"
                  onClick={() => setShowSidebarNewFolder(true)}
                  title="Lumikha ng bagong folder"
                >
                  <IconFolderPlus size={14} />
                  <span>Bagong Folder</span>
                </button>}

                {!isReaderMode && <div className="ribbon-sep"></div>}

                {/* Sort dropdown */}
                <div className="os-sort-wrap">
                  <span className="os-sort-label">Sort:</span>
                  <select
                    className="os-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="number-asc">Numero (#1 - #9)</option>
                    <option value="number-desc">Numero (#9 - #1)</option>
                    <option value="alpha-asc">Pangalan (A - Z)</option>
                    <option value="alpha-desc">Pangalan (Z - A)</option>
                    <option value="date-newest">Petsa (Bago muna)</option>
                  </select>
                </div>

                <div className="ribbon-sep"></div>

                {/* View Mode Toggle */}
                <div className="os-view-mode-toggle">
                  <button
                    type="button"
                    className={`os-view-btn ${fileViewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setFileViewMode('grid')}
                    title="Icon Grid View"
                  >
                    <IconGrid size={13} className="os-inline-icon" />
                    <span>Icons</span>
                  </button>
                  <button
                    type="button"
                    className={`os-view-btn ${fileViewMode === 'details' ? 'active' : ''}`}
                    onClick={() => setFileViewMode('details')}
                    title="Details List View"
                  >
                    <IconList size={13} className="os-inline-icon" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile View Switcher Tab Bar */}
            <div className="os-mobile-tab-bar" role="tablist" aria-label="Explorer Navigation">
              <button
                type="button"
                role="tab"
                aria-selected={mobileExplorerTab === 'folders'}
                className={`os-mobile-tab-btn ${mobileExplorerTab === 'folders' ? 'active' : ''}`}
                onClick={() => setMobileExplorerTab('folders')}
              >
                <IconFolder size={14} className="os-inline-icon" />
                <span>Mga Folder ({allFolderNames.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileExplorerTab === 'files'}
                className={`os-mobile-tab-btn ${mobileExplorerTab === 'files' ? 'active' : ''}`}
                onClick={() => setMobileExplorerTab('files')}
              >
                <IconFileText size={14} className="os-inline-icon" />
                <span>Mga Tala ({sortedEntries.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileExplorerTab === 'preview'}
                className={`os-mobile-tab-btn ${mobileExplorerTab === 'preview' ? 'active' : ''}`}
                onClick={() => setMobileExplorerTab('preview')}
              >
                <IconEye size={14} className="os-inline-icon" />
                <span>Preview {selectedEntry ? `(#${selectedEntry.entryNumber})` : ''}</span>
              </button>
            </div>

            {/* Split Main Explorer Body */}
            <div className="os-explorer-body" data-mobile-tab={mobileExplorerTab}>

              {/* Left Navigation Pane (Folders Sidebar) */}
              <div className={`os-sidebar-pane mobile-pane ${mobileExplorerTab === 'folders' ? 'active-mobile-pane' : ''}`}>
                <div className="sidebar-group-label">QUICK ACCESS / MGA FOLDER</div>
                <div className="os-folder-tree">
                  <div
                    className={`tree-item ${selectedFolderFilter === 'Lahat' ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedFolderFilter('Lahat');
                      setSelectedFileId(null);
                      setMobileExplorerTab('files');
                    }}
                  >
                    <IconFolderOpen size={14} className="tree-icon" />
                    <span className="tree-name">Lahat ng Sulat</span>
                    <span className="tree-count">{savedEntries.length}</span>
                  </div>

                  {allFolderNames.map((fName) => {
                    const count = savedEntries.filter((e) => (e.folder || 'Personal') === fName).length;
                    return (
                      <div
                        key={fName}
                        className={`tree-item ${selectedFolderFilter === fName ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSelectedFolderFilter(fName);
                          setSelectedFileId(null);
                          setMobileExplorerTab('files');
                        }}
                      >
                        <IconFolder size={14} className="tree-icon" />
                        <span className="tree-name">{fName}</span>
                        <span className="tree-count">{count}</span>
                      </div>
                    );
                  })}

                  {!isReaderMode && showSidebarNewFolder && (
                    <div className="tree-new-folder-inline">
                      <IconFolder size={14} className="tree-icon" />
                      <input
                        type="text"
                        className="new-folder-sidebar-input"
                        placeholder="Pangalan..."
                        value={newFolderSidebarText}
                        onChange={(e) => setNewFolderSidebarText(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (newFolderSidebarText.trim()) {
                              handleCreateNewFolder(newFolderSidebarText.trim());
                              setNewFolderSidebarText('');
                            }
                            setShowSidebarNewFolder(false);
                          }
                          if (e.key === 'Escape') {
                            setShowSidebarNewFolder(false);
                            setNewFolderSidebarText('');
                          }
                        }}
                        onBlur={() => {
                          if (newFolderSidebarText.trim()) {
                            handleCreateNewFolder(newFolderSidebarText.trim());
                            setNewFolderSidebarText('');
                          }
                          setShowSidebarNewFolder(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Center Pane: File Display (Grid or Details) */}
              <div className={`os-files-center-pane mobile-pane ${mobileExplorerTab === 'files' ? 'active-mobile-pane' : ''}`}>
                {/* Horizontal Quick Folder Chips for Mobile */}
                <div className="os-folder-chips-bar" aria-label="Mabilisang Pagpili ng Folder">
                  <button
                    type="button"
                    className={`os-chip-btn ${selectedFolderFilter === 'Lahat' ? 'is-active' : ''}`}
                    onClick={() => setSelectedFolderFilter('Lahat')}
                  >
                    <IconFolder size={12} className="os-inline-icon" />
                    <span>Lahat ({savedEntries.length})</span>
                  </button>
                  {allFolderNames.map((fName) => {
                    const count = savedEntries.filter((e) => (e.folder || 'Personal') === fName).length;
                    return (
                      <button
                        key={fName}
                        type="button"
                        className={`os-chip-btn ${selectedFolderFilter === fName ? 'is-active' : ''}`}
                        onClick={() => setSelectedFolderFilter(fName)}
                      >
                        <IconFolder size={12} className="os-inline-icon" />
                        <span>{fName} ({count})</span>
                      </button>
                    );
                  })}
                </div>

                {sortedEntries.length === 0 ? (
                  <div className="os-empty-folder">
                    <IconFolderOpen size={48} className="empty-icon" />
                    <p className="empty-text">Walang laman ang folder na ito</p>
                    <p className="empty-sub">
                    {isReaderMode ? 'Wala pang nakaimbak na sulat para i-preview.' : 'Magsulat sa papel at i-click ang "I-save sa Folder" sa ibaba.'}
                    </p>
                  </div>
                ) : fileViewMode === 'grid' ? (
                  /* Desktop Icons Grid */
                  <div className="os-desktop-icons-grid">
                    {sortedEntries.map((entry) => {
                      const isSelected = selectedEntry?.id === entry.id;
                      return (
                        <div
                          key={entry.id}
                          className={`os-desktop-file-item ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            setSelectedFileId(entry.id);
                            if (isReaderMode) {
                              setPreviewingEntry(entry);
                            } else {
                              setMobileExplorerTab('preview');
                            }
                          }}
                          onDoubleClick={() => setPreviewingEntry(entry)}
                          title={isReaderMode ? 'I-click para buksan at basahin ang buong sulat' : 'I-click para pumili, double-click para buksan ang buong sulat'}
                        >
                          <div className="desktop-icon-wrap">
                            <IconFileText size={38} className="desktop-vector-doc-icon" />
                            <span className="desktop-entry-pill">#{entry.entryNumber}</span>
                          </div>
                          <div className="desktop-file-name" title={entry.title}>
                            {entry.title || 'Walang Pamagat'}
                          </div>
                          <div className="desktop-file-meta">
                            {entry.folder || 'Personal'}
                          </div>
                          <div className="desktop-file-tap-hint">
                            {isReaderMode ? 'Tap para basahin →' : 'Tap para sa preview / edit →'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Desktop Details List View */
                  <div className="os-details-table-wrap">
                    <table className="os-details-table">
                      <thead>
                        <tr>
                          <th className="th-name">Pangalan (Name)</th>
                          <th className="th-num"># Tala</th>
                          <th className="th-folder">Folder</th>
                          <th className="th-date">Petsa (Date)</th>
                          <th className="th-author">May-akda</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedEntries.map((entry) => {
                          const isSelected = selectedEntry?.id === entry.id;
                          return (
                            <tr
                              key={entry.id}
                              className={`os-table-row ${isSelected ? 'is-selected' : ''}`}
                              onClick={() => {
                                setSelectedFileId(entry.id);
                                if (isReaderMode) {
                                  setPreviewingEntry(entry);
                                } else {
                                  setMobileExplorerTab('preview');
                                }
                              }}
                              onDoubleClick={() => setPreviewingEntry(entry)}
                            >
                              <td className="td-name">
                                <IconFileText size={14} className="table-vector-doc-icon" />
                                <strong>{entry.title}</strong>
                                {entry.subtitle && (
                                  <span className="table-subtitle"> — {entry.subtitle}</span>
                                )}
                              </td>
                              <td className="td-num">#{entry.entryNumber}</td>
                              <td className="td-folder">{entry.folder || 'Personal'}</td>
                              <td className="td-date">{entry.date}</td>
                              <td className="td-author">{entry.author || 'Steven'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Pane: Desktop Preview Pane (With EDIT NOW!) */}
              <div className={`os-preview-sidebar-pane mobile-pane ${mobileExplorerTab === 'preview' ? 'active-mobile-pane' : ''}`}>
                {/* Mobile Back Button to Return to Files List */}
                <div className="os-mobile-preview-back-bar">
                  <button
                    type="button"
                    className="os-mobile-back-btn"
                    onClick={() => setMobileExplorerTab('files')}
                  >
                    <IconArrowLeft size={13} className="os-inline-icon" />
                    <span>Bumalik sa listahan ng mga tala</span>
                  </button>
                </div>

                {selectedEntry ? (
                  <div className="preview-pane-content">
                    <div className="preview-pane-top-badge">
                      <span>PREVIEW PANE</span>
                      <button
                        type="button"
                        className="btn-full-preview"
                        onClick={() => setPreviewingEntry(selectedEntry)}
                        title="I-preview sa malaking papel"
                      >
                        <IconMaximize size={11} className="os-inline-icon" />
                        <span>Buong Papel</span>
                      </button>
                    </div>

                    <div className="preview-pane-doc-header">
                      <div className="doc-num-tag">TALA #{selectedEntry.entryNumber}</div>
                      <h4 className="doc-preview-title">{selectedEntry.title}</h4>
                      {selectedEntry.subtitle && (
                        <p className="doc-preview-subtitle">{selectedEntry.subtitle}</p>
                      )}

                      <div className="doc-meta-info">
                        <div className="doc-meta-item">
                          <IconFolder size={12} className="meta-v-icon" />
                          <span>Folder: <strong>{selectedEntry.folder}</strong></span>
                        </div>
                        <div className="doc-meta-item">
                          <IconCalendar size={12} className="meta-v-icon" />
                          <span>Petsa: <strong>{selectedEntry.date}</strong></span>
                        </div>
                        <div className="doc-meta-item">
                          <IconUser size={12} className="meta-v-icon" />
                          <span>May-akda: <strong>{selectedEntry.author}</strong></span>
                        </div>
                        {selectedEntry.images?.length > 0 && (
                          <div className="doc-meta-item">
                            <IconImage size={12} className="meta-v-icon" />
                            <span>Larawan: <strong>{selectedEntry.images.length} nakakabit</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview Snippet / Body */}
                    <div className="preview-pane-snippet">
                      <div
                        className="preview-pane-body"
                        dangerouslySetInnerHTML={{
                          __html: selectedEntry.content || '<em>Walang nilalaman na teksto...</em>'
                        }}
                      />
                    </div>

                    {/* Actions: Tagabasa (Reader) vs Tagasulat (Writer) */}
                    {isReaderMode ? (
                      <div className="preview-pane-actions reader-actions">
                        <button
                          type="button"
                          className="os-btn-read-full"
                          onClick={() => setPreviewingEntry(selectedEntry)}
                        >
                          <IconEye size={14} className="os-btn-vector-icon" />
                          <span>BASAHIN ANG BUONG SULAT</span>
                        </button>
                        <button
                          type="button"
                          className="os-btn-subtle"
                          onClick={() => setSharingEntry(selectedEntry)}
                        >
                          <IconShare size={12} className="os-inline-icon" />
                          <span>I-share sa Story</span>
                        </button>
                      </div>
                    ) : (
                      <div className="preview-pane-actions">
                        <button
                          type="button"
                          className="os-btn-edit-now"
                          onClick={() => handleEditNow(selectedEntry)}
                        >
                          <IconEdit size={14} className="os-btn-vector-icon" />
                          <span>EDIT NOW (I-edit Ngayon)</span>
                        </button>

                        <div className="preview-pane-sub-actions">
                          <button
                            type="button"
                            className="os-btn-subtle"
                            onClick={() => setSharingEntry(selectedEntry)}
                          >
                            <IconShare size={12} className="os-inline-icon" />
                            <span>I-share</span>
                          </button>
                          <button
                            type="button"
                            className="os-btn-subtle"
                            onClick={() => setPreviewingEntry(selectedEntry)}
                          >
                            <IconEye size={12} className="os-inline-icon" />
                            <span>Buong Sulat</span>
                          </button>
                          <button
                            type="button"
                            className="os-btn-delete"
                            onClick={() =>
                              handleDeleteEntry(selectedEntry.id, selectedEntry.title)
                            }
                          >
                            <IconTrash size={12} className="os-inline-icon" />
                            <span>Burahin</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="preview-pane-empty">
                    <IconFileText size={40} className="empty-preview-icon" />
                    <p className="empty-preview-text">
                      {isReaderMode ? 'Pumili ng sulat upang makita ang buong preview.' : <>Pumili ng sulat mula sa gitna upang makita ang preview at makapag-<strong>EDIT NOW</strong>.</>}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Desktop Statusbar */}
            <div className="os-statusbar">
              <div className="status-left">
                <span>{sortedEntries.length} tala nakalista</span>
                <span>•</span>
                <span>Folder: {selectedFolderFilter}</span>
              </div>
              <div className="status-right">
                {selectedEntry ? (
                  <span>Pinili: "{selectedEntry.title}" (#{selectedEntry.entryNumber})</span>
                ) : (
                  <span>Walang napiling file</span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          FULL LETTER PREVIEW MODAL (Papel na Sulat View)
          ======================================================== */}
      {previewingEntry && (
        <div className="journal-modal-overlay" onClick={() => setPreviewingEntry(null)}>
          <div className="archive-cabinet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="archive-modal-header">
              <div className="archive-title-group">
                <div className="archive-mini-tag">BUONG PREVIEW NG TALA</div>
                <h3 className="archive-main-title">{previewingEntry.title}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewingEntry(null)}
              >
                ✕
              </button>
            </div>

            <div className="archive-preview-container">
              <div className="preview-top-breadcrumb">
                <button
                  type="button"
                  className="btn-back-to-folders"
                  onClick={() => setPreviewingEntry(null)}
                >
                  <IconArrowLeft size={13} className="os-inline-icon" />
                  <span>Bumalik sa File Explorer</span>
                </button>
                <span className="preview-folder-tag">
                  <IconFolder size={12} className="os-inline-icon" />
                  <span>{previewingEntry.folder || 'Personal'} // Tala #{previewingEntry.entryNumber}</span>
                </span>
              </div>

              {/* The Letter Preview Paper Sheet */}
              <div className="preview-letter-paper">
                <div className="preview-paper-header">
                  <span className="preview-entry-num">TALA #{previewingEntry.entryNumber}</span>
                  <h2 className="preview-entry-title">{previewingEntry.title}</h2>
                  {previewingEntry.subtitle && (
                    <h4 className="preview-entry-subtitle">{previewingEntry.subtitle}</h4>
                  )}
                  <div className="preview-entry-meta">
                    <span className="meta-chip">
                      <IconUser size={12} className="chip-icon" />
                      <span>May-akda: <strong>{previewingEntry.author || 'Walang Pangalan'}</strong></span>
                    </span>
                    <span>•</span>
                    <span className="meta-chip">
                      <IconCalendar size={12} className="chip-icon" />
                      <span>Petsa: <strong>{previewingEntry.date}</strong></span>
                    </span>
                    <span>•</span>
                    <span className="meta-chip">
                      <IconFolder size={12} className="chip-icon" />
                      <span>Folder: <strong>{previewingEntry.folder || 'Personal'}</strong></span>
                    </span>
                  </div>
                </div>

                <hr className="preview-divider" />

                {/* Body Content */}
                <div
                  className="preview-entry-body"
                  style={{ fontFamily: previewingEntry.font || 'var(--font-mono)' }}
                  dangerouslySetInnerHTML={{
                    __html: previewingEntry.content || '<em>Walang nilalaman na teksto.</em>'
                  }}
                />

                {/* Attached Photos in Preview */}
                {previewingEntry.images?.length > 0 && (
                  <div className="preview-images-cluster">
                    <div className="preview-images-label">
                      <IconImage size={13} className="os-inline-icon" />
                      <span>MGA NAKALAKIP NA LARAWAN ({previewingEntry.images.length}):</span>
                    </div>
                    <div className="preview-images-grid">
                      {previewingEntry.images.map((img, i) => (
                        <div key={img.id || i} className={`preview-img-frame frame-${img.frameStyle || 'tape'}`}>
                          <img src={img.src} alt="Journal Attachment" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="preview-action-dock">
                {!isReaderMode && (
                  <button
                    type="button"
                    className="btn-edit-now"
                    onClick={() => handleEditNow(previewingEntry)}
                  >
                    <IconEdit size={14} className="os-btn-vector-icon" />
                    <span>EDIT NOW (I-edit Ngayon)</span>
                  </button>
                )}

                {isReaderMode && (
                  <button
                    type="button"
                    className="btn-preview-subtle"
                    onClick={() => setPreviewingEntry(null)}
                  >
                    <IconArrowLeft size={14} className="os-btn-vector-icon" />
                    <span>Bumalik sa Listahan</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-preview-subtle"
                  onClick={() => setSharingEntry(previewingEntry)}
                >
                  <IconShare size={14} className="os-btn-vector-icon" />
                  <span>I-share sa Story</span>
                </button>

                {!isReaderMode && (
                  <>
                    <button
                      type="button"
                      className="btn-preview-subtle"
                      onClick={handlePrint}
                    >
                      <IconPrinter size={14} className="os-btn-vector-icon" />
                      <span>I-print / PDF</span>
                    </button>

                    <button
                      type="button"
                      className="btn-preview-delete"
                      onClick={() => handleDeleteEntry(previewingEntry.id, previewingEntry.title)}
                    >
                      <IconTrash size={14} className="os-btn-vector-icon" />
                      <span>Burahin</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
