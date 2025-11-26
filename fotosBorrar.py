import os
from pathlib import Path
from PIL import Image

# Ruta base
base_path = Path(r"C:\Users\RafaelO\Documents\proyectos\TMIWEB\src\assets\modelos")

print(f"📂 Carpeta base: {base_path}")

# Recorre cada subcarpeta dentro de "modelos"
for folder in base_path.iterdir():
    if folder.is_dir():
        print(f"\n➡️ Procesando carpeta: {folder.name}")
        folder_name = folder.name.lower().replace(" ", "_")

        files = list(folder.glob("*.*"))
        if not files:
            print("⚠️ No se encontraron archivos en esta carpeta.")
            continue

        for i, file in enumerate(files, start=1):
            ext = file.suffix.lower()
            if ext in [".jpg", ".jpeg", ".png"]:
                new_name = f"{folder_name}_{i}.webp"
                new_path = folder / new_name

                try:
                    img = Image.open(file).convert("RGB")
                    img.save(new_path, "webp")
                    print(f"✅ {file.name} → {new_name}")

                    # 🔥 Borrar el archivo original
                    os.remove(file)
                    print(f"🗑️ Eliminado original: {file.name}")

                except Exception as e:
                    print(f"❌ Error con {file.name}: {e}")
            else:
                print(f"⏭️ Saltando {file.name} (extensión {ext})")
