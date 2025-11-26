import os
from pathlib import Path
from PIL import Image

# Ruta base
base_path = Path(r"C:\Users\RafaelO\Documents\proyectos\TMIWEB\src\assets\modelos")

# Recorre cada subcarpeta dentro de "modelos"
for folder in base_path.iterdir():
    if folder.is_dir():
        # Normaliza el nombre de la carpeta para usarlo en el archivo
        folder_name = folder.name.lower().replace(" ", "_")
        
        # Itera sobre las imágenes dentro de la carpeta
        for i, file in enumerate(folder.glob("*.*"), start=1):
            # Solo procesa imágenes comunes
            if file.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                # Nuevo nombre con índice incremental
                new_name = f"{folder_name}_{i}.webp"
                new_path = folder / new_name

                # Convertir a webp
                try:
                    img = Image.open(file).convert("RGB")
                    img.save(new_path, "webp")
                    print(f"✅ {file.name} → {new_name}")
                except Exception as e:
                    print(f"⚠️ Error con {file.name}: {e}")
