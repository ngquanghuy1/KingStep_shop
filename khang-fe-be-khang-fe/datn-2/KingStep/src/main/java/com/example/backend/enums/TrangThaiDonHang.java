package com.example.backend.enums;
public enum TrangThaiDonHang {

    CHO_XAC_NHAN(0),
    XAC_NHAN(1),
    DANG_CHUAN_BI(2),
    DANG_GIAO(3),
    DA_GIAO(4),
    DA_HUY(5),
    TRA_HANG_HOAN_TIEN(6);

    private final int value;

    TrangThaiDonHang(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static TrangThaiDonHang fromValue(int value) {
        for (TrangThaiDonHang t : values()) {
            if (t.getValue() == value) return t;
        }
        throw new IllegalArgumentException("Trạng thái không hợp lệ: " + value);
    }


    public String getDisplayName() {
        return switch (this) {
            case CHO_XAC_NHAN-> "Chờ xác nhận";
            case XAC_NHAN-> "Xác nhận";
            case DANG_CHUAN_BI -> "Đang chuẩn bị";
            case DANG_GIAO -> "Đang giao";
            case DA_GIAO -> "Đã giao";
            case DA_HUY -> "Đã hủy";
            case TRA_HANG_HOAN_TIEN -> "Trả hàng / Hoàn tiền";
        };
    }
}

