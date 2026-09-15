# ABC qualitative comparison originals / ABC 定性对比原图

Contains only A/B/C, the seven-row external-comparison version, at **0s, 1s, 2s, 3s, 4s, 5s**.
共252张逐格PNG（3组×7行×2视角×6时刻）、3张完整figure PNG、6张独立参考图。

## Browse / 使用

Open `index.html` to browse locally. Each case contains `frames/<model>/<view>/`, `figures/`, and `references/`.
文件名重复标明组别、模型、视角、秒数与语义帧号，例如 `C_06_ours_T2-P0005_t03s_f048.png`。
逐帧PNG保留评估原片的832×480解码像素，无框、无裁切、无新增增强；figure保留目前展示的参考框和版式。
`annotations.json` 提供figure中的参考框/放大区域，便于重新排版。`manifest.csv` 可用表格软件筛选模型、视角、时刻。

| Folder / 目录 | Model / 方法 |
| --- | --- |
| `00_gt` | Ground truth |
| `01_lingbot_base` | LingBot-World Base-Cam |
| `02_direct_residual_b1` | Direct Residual (B1 step50; resource-limited) |
| `03_vid2world` | Vid2World (CSGO) |
| `04_multiworld` | MultiWorld (480p FullData) |
| `05_solaris_minecraft` | Solaris (Minecraft pretrained) |
| `06_ours` | Ours (step8500) |

## Interpretation / 使用口径

- “7方法”沿用选图页称呼，实际为GT参考行加6种模型/方法。
- 0s is a shared GT input reference repeated in all rows. It is not a generated result or each external model's native preprocessed input. 因此42个0秒文件对应6张独立输入参考。
- Frames 1-5s use the existing audited time mapping. Vid2World native 4fps repeated-frame mapping and MultiWorld native 60fps sampling are preserved; no temporal interpolation was added.
- Base uses initial RGB and camera trajectory; B1/Ours also use dense/state; Vid2World uses pre-start RGB context and CSGO actions; MultiWorld uses paired initial images and mapped actions; Minecraft Solaris uses initial images and mapped actions. These are references with different native input protocols, not matched-budget training comparisons.
- B1 is the resource-limited step50 baseline. Ours uses step8500. No historical three-view model is included.
- Map/camera paths and yaw curves are recorded reference inputs. Yaw is computed from the c2w forward vector, unwrapped and relative to 0s. The trajectories include translation and are not 360-degree closed loops.
- A uses the f45a714c/Ep16/raw3580 pair; B uses 708581/Ep17/raw16 with a stationary reference target; C uses ee01dd44/Ep25/raw3094. Exact group and view IDs are in the manifest.
- Boxes are fixed GT/state reference regions, not predicted detections or identity certification. Examples were selected post hoc and do not establish aggregate test performance or full-lineage unseen status.

No source video, model weight, server path, private run log or unrelated supplementary group is included.
