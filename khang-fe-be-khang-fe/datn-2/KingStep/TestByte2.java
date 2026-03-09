public class TestByte2 {
    public static void main(String[] args) {
        byte b = -128; // 0x80
        System.out.println("Result without mask: " + String.format("%02x", b));
        System.out.println("Result with mask: " + String.format("%02x", b & 0xff));
        
        byte b2 = -4; // 0xfc
        System.out.println("b2 without mask: " + String.format("%02x", b2));
        System.out.println("b2 with mask: " + String.format("%02x", b2 & 0xff));
    }
}
