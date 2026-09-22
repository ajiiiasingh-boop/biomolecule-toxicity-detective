/**
 * content.js — read-only reference endpoints.
 *
 * Everything here is static teaching material: the biomolecule database, the
 * mechanism catalogue, the five-stage mechanism map, the cell map and the
 * toxin library. No answer keys pass through these routes.
 */

import { Router } from 'express';
import {
  BIOMOLECULES,
  biomoleculeById,
  MECHANISMS,
  MECHANISM_MAP,
  CELL_MAP,
  TOXIN_CATEGORIES,
  toxinCategoryById,
  RULE_TEXT,
  SCORE_RULES,
  PROJECT
} from '../../shared/index.js';
import { route, notFound } from '../lib/http.js';

const router = Router();

router.get('/meta', route((req, res) => {
  res.json({
    project: PROJECT,
    scoreRules: SCORE_RULES,
    scoreRuleText: RULE_TEXT,
    counts: {
      cases: 6,
      biomolecules: BIOMOLECULES.length,
      mechanisms: MECHANISMS.length,
      toxinCategories: TOXIN_CATEGORIES.length
    }
  });
}));

router.get('/biomolecules', route((req, res) => {
  res.json({ biomolecules: BIOMOLECULES });
}));

router.get('/biomolecules/:id', route((req, res) => {
  const found = biomoleculeById(req.params.id);
  if (!found) throw notFound('biomolecule', req.params.id);
  res.json({ biomolecule: found });
}));

router.get('/mechanisms', route((req, res) => {
  res.json({ mechanisms: MECHANISMS });
}));

router.get('/mechanism-map', route((req, res) => {
  res.json({ mechanismMap: MECHANISM_MAP });
}));

router.get('/cell-map', route((req, res) => {
  res.json({ cellMap: CELL_MAP });
}));

router.get('/toxins', route((req, res) => {
  res.json({ categories: TOXIN_CATEGORIES });
}));

router.get('/toxins/:id', route((req, res) => {
  const found = toxinCategoryById(req.params.id);
  if (!found) throw notFound('toxin category', req.params.id);
  res.json({ category: found });
}));

export default router;
