import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { getAuth } from 'firebase-admin/auth';

export async function listUsers(_req: AuthRequest, res: Response) {
  try {
    const auth = getAuth();
    const listResult = await auth.listUsers(1000);
    const users = listResult.users.map((u) => ({
      uid: u.uid,
      email: u.email ?? '',
      displayName: u.displayName ?? '',
      disabled: u.disabled,
      creationTime: u.metadata.creationTime,
      lastSignInTime: u.metadata.lastSignInTime,
      customClaims: u.customClaims ?? {},
    }));
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}

export async function getUser(req: AuthRequest, res: Response) {
  try {
    const auth = getAuth();
    const uid = String(req.params.uid);
    const userRecord = await auth.getUser(uid);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email ?? '',
      displayName: userRecord.displayName ?? '',
      disabled: userRecord.disabled,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      customClaims: userRecord.customClaims ?? {},
    });
  } catch {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const auth = getAuth();
    const uid = String(req.params.uid);
    const { displayName, disabled, role } = req.body as {
      displayName?: string;
      disabled?: boolean;
      role?: string;
    };

    const updatePayload: Record<string, unknown> = {};
    if (displayName !== undefined) updatePayload.displayName = displayName;
    if (disabled !== undefined) updatePayload.disabled = disabled;

    if (role !== undefined) {
      await auth.setCustomUserClaims(uid, { role });
    }

    const userRecord = await auth.updateUser(uid, updatePayload);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email ?? '',
      displayName: userRecord.displayName ?? '',
      disabled: userRecord.disabled,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      customClaims: userRecord.customClaims ?? {},
    });
  } catch {
    res.status(400).json({ error: 'Error al actualizar usuario' });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const auth = getAuth();
    const uid = String(req.params.uid);
    await auth.deleteUser(uid);
    res.json({ message: 'Usuario eliminado' });
  } catch {
    res.status(400).json({ error: 'Error al eliminar usuario' });
  }
}
